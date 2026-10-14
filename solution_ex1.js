const fastChargingRate = 4500;
const waitingQueue = ['29A-112.33', '30E-889.12', '51K-678.99'];

// Sửa lỗi 1: Dùng shift() thay vì pop() để lấy xe ở đầu hàng đợi (chỉ số 0) theo đúng chuẩn FIFO
const nextVehicle = waitingQueue.shift();
console.log('Xe được điều phối vào sạc:', nextVehicle);

const completedSessionsKwh = [45.2, 30.5, 62.8, 28.0];
let totalKwh = 0;

// Sửa lỗi 2: Thay đổi điều kiện từ i <= length thành i < length để tránh truy cập phần tử undefined gây NaN
for (let i = 0; i < completedSessionsKwh.length; i++) {
  totalKwh += completedSessionsKwh[i];
}

const totalRevenue = totalKwh * fastChargingRate;
console.log('Tổng sản lượng:', totalKwh, 'kWh');
console.log('Tổng doanh thu:', totalRevenue, 'VNĐ');