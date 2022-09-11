const User = require('./models/user.js');
const Notes = require('./models/notes.js');
const Med = require('./models/med.js');
const nodemailer = require('nodemailer');

const contactEmail = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: 'iamharshraj202@gmail.com',
		pass: 'latpcposxnirjwdj',
	},
});

contactEmail.verify((error) => {
	if (error) {
		console.log(error);
	} else {
		console.log('Ready to Send');
	}
});

const NotesMail = async () => {
	const notes = await Notes.find({});
	for (var i = 0; i < notes.length; i++) {
		const curr = new Date();
		if (
			curr.getFullYear == notes[i].date.getFullYear &&
			curr.getMonth == notes[i].date.getMonth &&
			curr.getDate == notes[i].date.getDate &&
			((curr.getHours == parseInt(notes[i].time.substring(0, 2)) &&
				curr.getMinutes - parseInt(notes[i].time.substring(3)) <= 5) ||
				(curr.getHours == parseInt(notes[i].time.substring(0, 2)) - 1 &&
					5 >=
						60 +
							parseInt(notes[i].time.substring(3)) -
							curr.getMinutes))
		) {
			const user = await User.findOne({ _id: notes[i].username });
			const mail = {
				from: 'iamharshraj202@gmail.com',
				to: user.email,
				subject: 'Remainder',
				html: `<p>Message: ${notes[i].message}</p>
            <p>Time: ${notes[i].time}</p>
            <p>Date: ${notes[i].date}</p`,
			};
			contactEmail.sendMail(mail, (error) => {
				if (error) {
					console.log('ERROR: ', error);
				} else {
					console.log(
						'DEBUG: Email sent successfully to',
						user.email,
					);
				}
			});
			await Notes.remove({ _id: notes[i]._id });
			console.log(user);
		}
	}
};

const MedMail = async () => {
	const notes = await Med.find({});
	for (var i = 0; i < notes.length; i++) {
		if (
			curr.getFullYear == notes[i].date.getFullYear &&
			curr.getMonth == notes[i].date.getMonth &&
			curr.getDate == notes[i].date.getDate &&
			((curr.getHours == parseInt(notes[i].time.substring(0, 2)) &&
				curr.getMinutes - parseInt(notes[i].time.substring(3)) <= 5) ||
				(curr.getHours == parseInt(notes[i].time.substring(0, 2)) - 1 &&
					5 >=
						60 +
							parseInt(notes[i].time.substring(3)) -
							curr.getMinutes))
		) {
			const user = await User.findOne({ _id: notes[i].username });
			const mail = {
				from: 'iamharshraj202@gmail.com',
				to: user.email,
				subject: 'Remainder',
				html: `<p>Message: ${notes[i].message}</p>
            <p>Time: ${notes[i].time}</p>
            <p>Date: ${notes[i].date}</p`,
			};
			contactEmail.sendMail(mail, (error) => {
				if (error) {
					console.log('ERROR: ', error);
				} else {
					console.log(
						'DEBUG: Email sent successfully to',
						user.email,
					);
				}
			});
			await Med.remove({ _id: notes[i]._id });
			console.log(user);
		}
	}
};

module.exports = {
	NotesMail,
	MedMail,
};
