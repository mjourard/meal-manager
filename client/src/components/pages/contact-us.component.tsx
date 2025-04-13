import React from 'react';

const ContactUs: React.FC = () => {
  const contactName = import.meta.env.VITE_CONTACT_NAME || 'Contact Name';
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com';
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE || 'Phone Number';

  return (
    <div className="container">
      <header>
        <h3>Contact Us</h3>
      </header>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">About Meal Manager</h5>
          <p className="card-text">
            Meal Manager is an application designed to help you organize and manage your recipes,
            create meal orders, and streamline the process of meal planning. Whether you're cooking
            for yourself, your family, or managing a food service, Meal Manager can help you stay
            organized and efficient.
          </p>
          
          <h5 className="card-title mt-4">Contact Information</h5>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <strong>Name:</strong> {contactName}
            </li>
            <li className="list-group-item">
              <strong>Email:</strong> <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </li>
            <li className="list-group-item">
              <strong>Phone:</strong> {contactPhone}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 