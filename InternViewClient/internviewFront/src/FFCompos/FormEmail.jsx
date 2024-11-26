import React from 'react';
import emailjs from 'emailjs-com';

function sendEmail(e) {
    e.preventDefault();

    emailjs.sendForm('service_riczz6e', 'template_ysrygc8', e.target, 'XevYnHw2VwCxgAt_1')
        .then((result) => {
            console.log('Email successfully sent!', result.text);
            // alert('Email sent successfully!');
        }, (error) => {
            console.log('Failed to send email.', error.text);
            // alert('Failed to send email: ' + error.text);
        });
}

function ContactForm() {
    return (
        <form onSubmit={sendEmail}>
            <label>שם:</label>
            <input type="text" name="user_name" required />
            <label>אימייל:</label>
            <input type="email" name="user_email" required />
            <label>הודעה:</label>
            <textarea name="message" required />
            <button type="submit">שלח</button>
        </form>
    );
}

export default ContactForm;
