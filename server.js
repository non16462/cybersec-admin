const express = require("express");
const { PrismaClient } = require("@prisma/client");
const bodyParser = require("body-parser");
const crypto = require("crypto-js");

const secretKey = 'llovemeloveme';
const app = express();
app.use(bodyParser.json());
const prisma = new PrismaClient();

app.get('/', (req, res) => {
    res.send('Hello world');
});

// อ่านข้อมูลผู้ใช้ทั้งหมด (ซ่อนรหัสผ่าน)
app.get('/user', async (req, res) => {
    const users = await prisma.user.findMany();
    users.forEach(user => delete user.password);
    
    // ใช้ .map() เพื่อดูข้อมูลทั้งหมด
    users.map(user => {
        console.log(user);
    });

    res.json({ message: 'ok', data: users });
});

// อ่านข้อมูลผู้ใช้ตาม ID (ถอดรหัสรหัสผ่าน)
app.get('/user/:id', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: +req.params.id }, 
        select: { id: true, username: true, password: true },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // ถอดรหัสรหัสผ่าน
    const decryptedPassword = crypto.AES.decrypt(user.password, secretKey).toString(crypto.enc.Utf8);

    console.log(user); // แสดงข้อมูลที่ดึงมา

    res.json({ message: 'ok', data: { id: user.id, username: user.username, password: decryptedPassword } });
});

// สร้างผู้ใช้ใหม่ (เข้ารหัสรหัสผ่าน)
app.post('/user', async (req, res) => {
    const { username, password } = req.body;
    const encryptedPassword = crypto.AES.encrypt(password, secretKey).toString();

    const user = await prisma.user.create({ 
        data: { username, password: encryptedPassword } 
    });

    console.log(user); // แสดงข้อมูลที่สร้างใหม่

    // ถ้าต้องการ map() ให้ user เป็นอาร์เรย์ก่อน
    [user].map(row => {
        console.log(row, row);
    });

    res.json({ message: 'User created successfully', data: user });
});

// อัปเดตข้อมูลผู้ใช้ (เข้ารหัสรหัสผ่านใหม่)
app.post('/user/:id', async (req, res) => {
    const { username, password } = req.body;
    const encryptedPassword = crypto.AES.encrypt(password, secretKey).toString();

    try {
        const updatedUser = await prisma.user.update({
            where: { id: +req.params.id },
            data: { username, password: encryptedPassword },
        });

        console.log(updatedUser); // แสดงข้อมูลที่อัปเดตแล้ว

        res.json({ message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
});

// ลบผู้ใช้
app.delete('/user/:id', async (req, res) => {
    try {
        await prisma.user.delete({ where: { id: +req.params.id } });
        console.log(`Deleted user ID: ${req.params.id}`);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: 'Error deleting user', error: error.message });
    }
});

// ค้นหาผู้ใช้ตาม username
app.get('/user/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        const data = await prisma.user.findMany({
            where: {
                username: { contains: query },
            },
            select: { id: true, username: true },
        });

        // ใช้ .map() เพื่อดูข้อมูลที่ค้นหาได้
        data.map(row => {
            console.log(row, row);
        });

        res.json({ message: 'ok', data });
    } catch (error) {
        res.status(400).json({ message: 'Error searching users', error: error.message });
    }
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
