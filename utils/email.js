const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.from = `${process.env.EMAIL_FROM}`;
		this.username = user.username;
		this.url = url;
	}

	newTransport() {
		if (process.env.NODE_ENV === 'production') {
			// Sendgrid
			return nodemailer.createTransport({
				service: 'SendCloud',
				auth: {
					user: process.env.SENDCLOUD_USER,
					pass: process.env.SENDCLOUD_API_KEY
				}
			});
		}

		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD
			}
		});
	}

	// Send the actual email
	async _send(template, subject) {
		// 1) Render the template
		const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
			username: this.username,
			url: this.url,
			subject
		});

		// 2) Define the mail mailOptions
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlToText.fromString(html)
		};
		// 3) Create a transport and send the email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendWelcome() {
		await this._send('welcome', '欢迎加入到Olib!');
	}

	async sendPasswordResetToken() {
		await this._send(
			'passwordReset',
			'Your password reset token(valid for only 10 minutes)'
		);
	}
};
