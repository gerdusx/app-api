import express from 'express';
import { ethers } from 'ethers';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello, TypeScript with Express!');
});

app.get('/api/vaults', (req, res) => {
    const users = 
        { ["0x963ffcd14D471E279245eE1570ad64ca78d8e67E"] : 59733463 }
    ;
    res.json(users);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
