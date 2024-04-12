const express = require('express');
const Order=require("../model/orderMdl");
const Product = require('../model/addProductMdl'); 
const User = require('../model/userSchema');
const PDFDocument = require('pdfkit'); 
const excelJS=require('exceljs')


exports.sales=async(req,res)=>{
    try {
        // Fetch start and end dates from query parameters
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const filterOption = req.query.filterOption; 
        

        // Construct query object for date filtration
        const query = {};
        if (startDate && endDate) {
            query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        } else if (startDate) {
            query.createdAt = { $gte: new Date(startDate) };
        } else if (endDate) {
            query.createdAt = {$lte: new Date(endDate) };
        }


        if (filterOption) {
            const currentDate = new Date();
            if (filterOption === 'daily') {
                const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                query.createdAt = { $gte: startOfDay };
            } else if (filterOption === 'weekly') {
                const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
                query.createdAt = { $gte: startOfWeek };
            } else if (filterOption === 'monthly') {
                const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                query.createdAt = { $gte: startOfMonth };
            } else if (filterOption === 'yearly') {
                const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
                query.createdAt = { $gte: startOfYear };
            }
        }

        

        // Fetch sales report data from the database with date filtration
        const salesReport = await Order.find(query).populate({
            path: 'items.product',
            select: 'productName quantity ' 
        }).exec();

        req.session.salesReport = salesReport;

        const overallSalesResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalPrice" }
                }
            }
        ]);

        const overallSales = overallSalesResult.length > 0 ? overallSalesResult[0].totalSales : 0;

        // Calculate total orders
        const totalOrders = await Order.countDocuments();

        // Calculate total users
        const totalUsers = await User.countDocuments();

        // Calculate total products
        const totalProducts = await Product.countDocuments();

        // Render the sales report page and pass the data to the EJS template
        res.render('salesreport', { salesReport, overallSales, totalOrders, totalUsers, totalProducts }); // Assuming your EJS file is named salesReport.ejs
    } catch (error) {
        console.error('Error fetching sales report:', error);
        // Handle errors appropriately, e.g., render an error page
        res.status(500).send('Internal Server Error');
    }
}

exports.generatePDF=async(req,res)=>{
    try {
       
        const doc = new PDFDocument(); // Create a new PDF document

        let salesReport = req.session.salesReport;

        if (!Array.isArray(salesReport)) {
            salesReport = [];
        }

        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"');

        // Pipe the PDF document to the response
        doc.pipe(res);

        // Add content to the PDF document
        doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown();

        // Loop through the sales report data and add rows to the PDF
        for (let i = 0; i < salesReport.length; i++) {
            const report = salesReport[i];

            let totalQuantity = 0;
            let totalPrice = 0;

            // Loop through items in the report and add details to the PDF
            report.items.forEach(function(item) {
                doc.fontSize(12).text(`Product ID: Decore${item.product._id.slice(-12)}`, { align: 'left' }).moveDown();

                doc.fontSize(12).text(`Product Name: ${item.product.productName}`, { align: 'left' }).moveDown();
                doc.fontSize(12).text(`Date: ${report.createdAt.toLocaleString()}`, { align: 'left' }).moveDown();
                doc.fontSize(12).text(`Quantity: ${item.quantity}`, { align: 'left' }).moveDown();
                doc.fontSize(12).text(`Price: ${report.totalPrice}`, { align: 'left' }).moveDown();

                // Move the starting point of the line downwards for spacing
                doc.moveTo(50, doc.y + 20)
                   .lineTo(550, doc.y + 20)
                   .stroke();

                   totalQuantity += item.quantity;
                   totalPrice += report.totalPrice;
            });
            doc.fontSize(12).text('Summary', { align: 'right' }).moveDown();
            doc.fontSize(13).text(`Total Quantity: ${totalQuantity}`, { align: 'right' }).moveDown();
            doc.fontSize(13).text(`Total Price: ${totalPrice}`, { align: 'right' }).moveDown();
        
            // Add some space after each report except for the last one
            if (i < salesReport.length - 1) {
                doc.moveDown(2); // Add 2 lines of space
            }
        }

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
}

exports.generateExcel=async(req,res)=>{
    try {
        let salesReport = req.session.salesReport;

        // Check if data is present and is an array
        if (!Array.isArray(salesReport) || salesReport.length === 0) {
            throw new Error('Data is empty or not an array');
        }

        // Create a new workbook and add a worksheet
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Define column headers and widths
        worksheet.columns = [
            { header: 'Product ID', key: '_id', width: 15 },
            { header: 'Product Name', key: 'p_name', width: 20 },
            { header: 'Date', key: 'createdAt', width: 15 },
            { header: 'Quantity', key: 'quantity', width: 15 },
            { header: 'Price', key: 'price', width: 15 },
        ];

        // Flatten the salesReport array to include items
        const flattenedSalesReport = salesReport.reduce((acc, report) => {
            report.items.forEach((item) => {
                acc.push({
                    _id: item.product._id,
                    p_name: item.product.productName,
                    createdAt: report.createdAt,
                    quantity: item.quantity,
                    price: report.totalPrice, // Assuming totalPrice is correct for each item
                });
            });
            return acc;
        }, []);

        // Add rows to the worksheet
        flattenedSalesReport.forEach((item) => {
            worksheet.addRow(item);
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        // Write the workbook to the response stream
        await workbook.xlsx.write(res);

        // End the response
        res.end();
    } catch (error) {
        console.error('Error generating Excel:', error.message);
        res.status(500).send('Internal Server Error: ' + error.message);
    }
 
}