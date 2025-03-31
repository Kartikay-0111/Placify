![Placify Logo](public/placify-logo.png)
# Placify - College Placement Management System

Placify is a modern **placement cell management system** that streamlines the job application process for students, companies, and college placement cells.

## 🚀 Tech Stack

- **Frontend**: React (Vite), TailwindCSS, DaisyUI
- **Backend & Database**: Supabase (Auth, Database, Backend Functions)

## 🎯 Features

### 🔹 Authentication & User Roles
- **Student Login/Signup** (Supabase Auth)
- **Company Login/Signup**
- **Placement Cell Admin (College)** manages student applications

### 🔹 Placement Process Flow
1. **Student signs up & completes profile** → Placement Cell verifies & approves
2. **Company posts a job** (with a list of eligible colleges)
3. **College Placement Cell approves the job listing**
4. **Students from the approved colleges can apply**
5. **Placement Cell reviews applications & forwards to the company**
6. **Company shortlists, schedules interviews & finalizes placements**
7. **Offers are generated & students accept/reject**

### 🔹 Core Functionalities
- Student Profile Management (Resume, Skills, CGPA, etc.)
- Job Listings (Companies create & manage job postings)
- Application Tracking (Status updates: Pending, Approved, Rejected)
- Interview Scheduling (Online/In-person with details)
- Offer Management (Students receive & accept/reject offers)

## 🛠️ Setup & Installation

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/yourusername/placify.git
cd placify
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Setup Supabase**
- Create a new project in [Supabase](https://supabase.com/)
- Copy your **API keys & Database URL**
- You need to create tables in supabase.
- The database schema is defined in [`tables.sql`](src/lib/tables.sql).

### **4️⃣ Add Environment Variables**
Create a `.env` file in the root folder and add:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **5️⃣ Run the Development Server**
```sh
npm run dev
```

## 🚀 Future Enhancements
- **Resume Parsing & Auto-Fill**
- **Real-time Chat with Placement Cell**
- **Placement Statistics & Reports**
- **AI-based Job Recommendations**
- **Export Student & Job Data**

## 📜 License
This project is licensed under the MIT License.

## 🤝 Contributing
Feel free to raise issues or contribute to the project via pull requests!

---
Made with ❤️ by Kartikay Pandey

