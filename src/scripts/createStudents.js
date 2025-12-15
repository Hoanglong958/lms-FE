/**
 * Script to create 50 students in the system
 * Run this script from the browser console or use it as a utility
 */

import { userService } from '../shared/utils/userService.js';

const firstNames = [
    'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi',
    'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Mai', 'Trương', 'Tô', 'Lương'
];

const middleNames = [
    'Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Quang', 'Tuấn', 'Thanh', 'Hoàng', 'Thành',
    'Công', 'Hải', 'Bảo', 'Phương', 'Ngọc', 'Kim', 'Hồng', 'Thu', 'Xuân', 'Mai'
];

const lastNames = [
    'An', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Giang', 'Hùng', 'Khoa', 'Long', 'Nam',
    'Phong', 'Quân', 'Sơn', 'Tài', 'Tùng', 'Vinh', 'Anh', 'Linh', 'Hương', 'Lan',
    'Mai', 'Nhi', 'Oanh', 'Phương', 'Quyên', 'Thảo', 'Uyên', 'Vân', 'Yến', 'Hà'
];

function generateRandomName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${middleName} ${lastName}`;
}

function generateEmail(fullName, index) {
    const name = fullName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/đ/g, 'd')
        .split(' ')
        .filter(part => part.length > 0);

    const lastName = name[name.length - 1];
    const firstName = name.slice(0, -1).map(n => n[0]).join('');
    return `${lastName}${firstName}${index}@student.edu.vn`;
}

function generatePhoneNumber() {
    const prefixes = ['032', '033', '034', '035', '036', '037', '038', '039', '086', '096', '097', '098'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = Math.floor(1000000 + Math.random() * 9000000);
    return `${prefix}${suffix}`;
}

async function createStudents(count = 100) {
    const students = [];

    console.log(`🚀 Starting to create ${count} students...\n`);

    for (let i = 1; i <= count; i++) {
        const fullName = generateRandomName();
        const email = generateEmail(fullName, i);
        const phone = generatePhoneNumber();
        const username = `student${String(i).padStart(3, '0')}`;

        const studentData = {
            username: username,
            password: 'Student@123',
            fullName: fullName,
            gmail: email, // Changed from email to gmail to match user.jsx
            phone: phone,
            role: 'ROLE_USER',
            isActive: true
        };

        try {
            const response = await userService.createUser(studentData);
            students.push(response.data);
            console.log(`✅ [${i}/${count}] Created: ${fullName} (${username})`);
        } catch (error) {
            console.error(`❌ [${i}/${count}] Failed to create ${username}:`, error.response?.data?.message || error.message);
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`\n🎉 Completed! Created ${students.length} out of ${count} students.`);
    return students;
}

// Export for use in other scripts
export { createStudents };

