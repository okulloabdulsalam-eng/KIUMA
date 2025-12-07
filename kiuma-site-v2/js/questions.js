// Questions Management System
// Teacher contact information - Update these with actual contacts when provided
const TEACHER_CONTACTS = {
    'all': {
        name: 'All Teachers',
        email: 'teachers@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX' // Update with actual phone
    },
    'imam-fahad': {
        name: 'Imam Fahad',
        email: 'imam.fahad@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        specialization: 'Quran, Tafsir, Arabic'
    },
    'imam-abdurrahman': {
        name: 'Imam Abdurrahman',
        email: 'imam.abdurrahman@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        specialization: 'Hadith, Tawheed'
    },
    'sheikh-abdulswabur': {
        name: 'Sheikh Abdulswabur',
        email: 'sheikh.abdulswabur@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        specialization: 'Hadith Explanation'
    },
    'prof-twaib': {
        name: 'Prof. Twaib',
        email: 'prof.twaib@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        specialization: 'Fiqh, Swalah'
    },
    'dr-jega': {
        name: 'Dr. Jega',
        email: 'dr.jega@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        specialization: 'Arbauna Nawawi'
    },
    'other': {
        name: 'Other Scholar',
        email: 'scholars@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX' // Update with actual phone
    }
};

// Department contact information - Update these with actual contacts when provided
const DEPARTMENT_CONTACTS = {
    'islamic-studies': {
        name: 'Islamic Studies Department',
        email: 'islamic.studies@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        coordinator: 'Department Coordinator'
    },
    'quran-memorization': {
        name: 'Quran Memorization Department',
        email: 'quran.memorization@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        coordinator: 'Department Coordinator'
    },
    'hadith-studies': {
        name: 'Hadith Studies Department',
        email: 'hadith.studies@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        coordinator: 'Department Coordinator'
    },
    'fiqh': {
        name: 'Fiqh Department',
        email: 'fiqh@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        coordinator: 'Department Coordinator'
    },
    'tafsir': {
        name: 'Tafsir Department',
        email: 'tafsir@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        coordinator: 'Department Coordinator'
    },
    'mentorship': {
        name: 'Student Mentorship Department',
        email: 'mentorship@kiuma.ac.ug', // Update with actual email
        phone: '+256 XXX XXX XXX', // Update with actual phone
        coordinator: 'Department Coordinator'
    }
};

// Initialize questions form
document.addEventListener('DOMContentLoaded', function() {
    setupQuestionForm();
    setupProgramEnrollmentForm();
});

// Setup question form submission
function setupQuestionForm() {
    const form = document.getElementById('question-form');
    if (form) {
        form.addEventListener('submit', handleQuestionSubmit);
    }
}

// Handle question form submission
function handleQuestionSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const messageDiv = document.getElementById('form-message');
    
    // Get form data
    const formData = {
        subject: document.getElementById('question-subject').value,
        content: document.getElementById('question-content').value,
        category: document.getElementById('question-category').value,
        teacher: document.getElementById('select-teacher').value,
        name: document.getElementById('questioner-name').value,
        email: document.getElementById('questioner-email').value,
        phone: document.getElementById('questioner-phone').value,
        timestamp: new Date().toISOString()
    };
    
    // Get teacher contact information
    const teacherInfo = TEACHER_CONTACTS[formData.teacher] || TEACHER_CONTACTS['all'];
    
    // Create email content
    const emailSubject = encodeURIComponent(`Question About Deen: ${formData.subject}`);
    const emailBody = createEmailBody(formData, teacherInfo);
    
    // Create mailto link
    const mailtoLink = `mailto:${teacherInfo.email}?subject=${emailSubject}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Show success message
    messageDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, rgba(13, 125, 61, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%); 
                    padding: 1.5rem; border-radius: 10px; border: 2px solid var(--islamic-green);">
            <h3 style="color: var(--islamic-green); margin-bottom: 1rem;">✅ Question Submitted Successfully!</h3>
            <p style="color: var(--text-dark); margin-bottom: 0.5rem;">
                Your question has been prepared and your email client should open automatically.
            </p>
            <p style="color: var(--text-dark); margin-bottom: 1rem;">
                <strong>Recipient:</strong> ${teacherInfo.name}<br>
                <strong>Email:</strong> ${teacherInfo.email}
            </p>
            <p style="color: var(--text-light); font-size: 0.9rem;">
                If your email client didn't open, please send your question manually to: 
                <a href="mailto:${teacherInfo.email}" style="color: var(--islamic-green);">${teacherInfo.email}</a>
            </p>
        </div>
    `;
    
    // Store question in localStorage (for tracking)
    saveQuestion(formData);
    
    // Reset form after a delay
    setTimeout(() => {
        form.reset();
        messageDiv.innerHTML = '';
    }, 10000);
}

// Create email body content
function createEmailBody(formData, teacherInfo) {
    let body = `Assalamu Alaikum ${teacherInfo.name},\n\n`;
    body += `I hope this message finds you in good health and Iman.\n\n`;
    body += `I have a question about the Deen that I would like to ask:\n\n`;
    body += `---\n`;
    body += `QUESTION SUBJECT: ${formData.subject}\n\n`;
    
    if (formData.category) {
        body += `CATEGORY: ${getCategoryLabel(formData.category)}\n\n`;
    }
    
    body += `QUESTION:\n${formData.content}\n\n`;
    body += `---\n\n`;
    body += `MY INFORMATION:\n`;
    if (formData.name) {
        body += `Name: ${formData.name}\n`;
    }
    body += `Email: ${formData.email}\n`;
    if (formData.phone) {
        body += `Phone: ${formData.phone}\n`;
    }
    body += `\n`;
    body += `I would be grateful if you could provide guidance on this matter.\n\n`;
    body += `Jazakallahu Khairan.\n\n`;
    body += `---\n`;
    body += `This question was submitted through the KIUMA website.\n`;
    body += `Submitted on: ${new Date().toLocaleString()}\n`;
    
    return body;
}

// Get category label
function getCategoryLabel(category) {
    const labels = {
        'aqeedah': 'Aqeedah (Beliefs)',
        'fiqh': 'Fiqh (Jurisprudence)',
        'quran': 'Quran & Tafsir',
        'hadith': 'Hadith',
        'sunnah': 'Sunnah & Practices',
        'worship': 'Worship (Ibadah)',
        'ethics': 'Ethics & Character (Akhlaq)',
        'family': 'Family & Social Issues',
        'contemporary': 'Contemporary Issues',
        'other': 'Other'
    };
    return labels[category] || category;
}

// Save question to localStorage (for tracking/backup)
function saveQuestion(questionData) {
    try {
        let questions = JSON.parse(localStorage.getItem('kiuma_questions') || '[]');
        questions.push({
            ...questionData,
            id: Date.now().toString()
        });
        localStorage.setItem('kiuma_questions', JSON.stringify(questions));
    } catch (e) {
        console.error('Error saving question:', e);
    }
}

// Function to update teacher contacts (can be called when contacts are provided)
function updateTeacherContacts(newContacts) {
    Object.assign(TEACHER_CONTACTS, newContacts);
}

// Setup program enrollment form
function setupProgramEnrollmentForm() {
    const form = document.getElementById('program-enrollment-form');
    if (form) {
        form.addEventListener('submit', handleProgramEnrollment);
    }
}

// Handle program enrollment form submission
function handleProgramEnrollment(e) {
    e.preventDefault();
    
    const form = e.target;
    const messageDiv = document.getElementById('enrollment-message');
    
    // Get selected programs
    const selectedPrograms = Array.from(form.querySelectorAll('input[name="programs[]"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedPrograms.length === 0) {
        messageDiv.innerHTML = '<p style="color: #e74c3c;">❌ Please select at least one program to join.</p>';
        return;
    }
    
    // Get form data
    const formData = {
        programs: selectedPrograms,
        name: document.getElementById('enrollment-name').value,
        email: document.getElementById('enrollment-email').value,
        phone: document.getElementById('enrollment-phone').value,
        level: document.getElementById('enrollment-level').value,
        year: document.getElementById('enrollment-year').value,
        message: document.getElementById('enrollment-additional-message').value,
        timestamp: new Date().toISOString()
    };
    
    // Get department contacts for selected programs
    const departmentContacts = selectedPrograms.map(program => DEPARTMENT_CONTACTS[program]);
    
    // Create email content for each department
    const emails = departmentContacts.map((dept, index) => {
        const emailSubject = encodeURIComponent(`Program Enrollment Request: ${getProgramLabel(selectedPrograms[index])}`);
        const emailBody = createEnrollmentEmailBody(formData, dept, selectedPrograms[index]);
        return {
            email: dept.email,
            subject: emailSubject,
            body: emailBody,
            department: dept.name
        };
    });
    
    // If multiple programs, send to all departments
    if (emails.length === 1) {
        // Single program - open one email
        const email = emails[0];
        const mailtoLink = `mailto:${email.email}?subject=${email.subject}&body=${encodeURIComponent(email.body)}`;
        window.location.href = mailtoLink;
        
        messageDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(13, 125, 61, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%); 
                        padding: 1.5rem; border-radius: 10px; border: 2px solid var(--islamic-green);">
                <h3 style="color: var(--islamic-green); margin-bottom: 1rem;">✅ Enrollment Request Prepared!</h3>
                <p style="color: var(--text-dark); margin-bottom: 0.5rem;">
                    Your enrollment request has been prepared and your email client should open automatically.
                </p>
                <p style="color: var(--text-dark); margin-bottom: 1rem;">
                    <strong>Program:</strong> ${getProgramLabel(selectedPrograms[0])}<br>
                    <strong>Recipient:</strong> ${email.department}<br>
                    <strong>Email:</strong> ${email.email}
                </p>
                <p style="color: var(--text-light); font-size: 0.9rem;">
                    If your email client didn't open, please send your request manually to: 
                    <a href="mailto:${email.email}" style="color: var(--islamic-green);">${email.email}</a>
                </p>
            </div>
        `;
    } else {
        // Multiple programs - show instructions
        const emailList = emails.map(e => `<li><strong>${getProgramLabel(selectedPrograms[emails.indexOf(e)])}:</strong> <a href="mailto:${e.email}?subject=${e.subject}&body=${encodeURIComponent(e.body)}" style="color: var(--islamic-green);">${e.email}</a></li>`).join('');
        
        messageDiv.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(13, 125, 61, 0.1) 0%, rgba(212, 175, 55, 0.1) 100%); 
                        padding: 1.5rem; border-radius: 10px; border: 2px solid var(--islamic-green);">
                <h3 style="color: var(--islamic-green); margin-bottom: 1rem;">✅ Enrollment Requests Prepared!</h3>
                <p style="color: var(--text-dark); margin-bottom: 1rem;">
                    You have selected <strong>${selectedPrograms.length} program(s)</strong>. Please send enrollment requests to each department:
                </p>
                <ul style="text-align: left; margin: 1rem 0; color: var(--text-dark);">
                    ${emailList}
                </ul>
                <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 1rem;">
                    Click on each email address above to send the enrollment request to that department.
                </p>
            </div>
        `;
    }
    
    // Store enrollment in localStorage (for tracking)
    saveEnrollment(formData);
    
    // Reset form after a delay
    setTimeout(() => {
        form.reset();
        messageDiv.innerHTML = '';
    }, 15000);
}

// Create enrollment email body
function createEnrollmentEmailBody(formData, department, program) {
    let body = `Assalamu Alaikum,\n\n`;
    body += `I hope this message finds you in good health and Iman.\n\n`;
    body += `I would like to enroll in the following program:\n\n`;
    body += `---\n`;
    body += `PROGRAM: ${getProgramLabel(program)}\n\n`;
    body += `MY INFORMATION:\n`;
    body += `Name: ${formData.name}\n`;
    body += `Email: ${formData.email}\n`;
    body += `Phone: ${formData.phone}\n`;
    body += `Academic Level: ${getLevelLabel(formData.level)}\n`;
    if (formData.year) {
        body += `Year/Class: ${formData.year}\n`;
    }
    body += `\n`;
    if (formData.message) {
        body += `ADDITIONAL MESSAGE:\n${formData.message}\n\n`;
    }
    body += `---\n\n`;
    body += `I am committed to attending the program and following all guidelines provided.\n\n`;
    body += `I would appreciate your confirmation and any further instructions regarding enrollment.\n\n`;
    body += `Jazakallahu Khairan.\n\n`;
    body += `---\n`;
    body += `This enrollment request was submitted through the KIUMA website.\n`;
    body += `Submitted on: ${new Date().toLocaleString()}\n`;
    
    return body;
}

// Get program label
function getProgramLabel(program) {
    const labels = {
        'islamic-studies': 'Islamic Studies',
        'quran-memorization': 'Quran Memorization',
        'hadith-studies': 'Hadith Studies',
        'fiqh': 'Fiqh (Islamic Jurisprudence)',
        'tafsir': 'Tafsir (Quranic Exegesis)',
        'mentorship': 'Student Mentorship'
    };
    return labels[program] || program;
}

// Get level label
function getLevelLabel(level) {
    const labels = {
        'undergraduate': 'Undergraduate',
        'postgraduate': 'Postgraduate',
        'university-staff': 'University Staff',
        'elder': 'Elder',
        'other': 'Other'
    };
    return labels[level] || level;
}

// Save enrollment to localStorage (for tracking/backup)
function saveEnrollment(enrollmentData) {
    try {
        let enrollments = JSON.parse(localStorage.getItem('kiuma_enrollments') || '[]');
        enrollments.push({
            ...enrollmentData,
            id: Date.now().toString()
        });
        localStorage.setItem('kiuma_enrollments', JSON.stringify(enrollments));
    } catch (e) {
        console.error('Error saving enrollment:', e);
    }
}

// Function to update department contacts (can be called when contacts are provided)
function updateDepartmentContacts(newContacts) {
    Object.assign(DEPARTMENT_CONTACTS, newContacts);
}

