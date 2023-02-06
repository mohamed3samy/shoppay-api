const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT, // if secure true port = 465, if false port = 587
		secure: true,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const mailOpts = {
		from: `Shoppay App <${process.env.EMAIL_USER}>`,
		to: options.email,
		subject: options.subject,
		text: options.message,
	};

	await transporter.sendMail(mailOpts);
};

module.exports = sendEmail;
