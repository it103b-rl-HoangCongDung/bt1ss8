# BÁO CÁO PHÂN TÍCH VÀ KHẮC PHỤC LỖI HÀNG ĐỢI FIFO TRẠM SẠC VINFAST

> 👤 **Học viên:** Hoàng Công Dũng | **Mã SV:** PTIT-HCM-009
> 🏫 **Môn học:** it103b-rl-HoangCongDung

---

## 📊 Sơ đồ thiết kế hệ thống (Flowchart)

> 💡 *Sơ đồ dưới đây được render tự động trực tiếp trên GitHub bằng Mermaid. Bạn cũng có thể tải file **`bt1.drawio`** trong repository này để mở và chỉnh sửa trực tiếp trên [Draw.io (diagrams.net)](https://app.diagrams.net).* 

```mermaid
graph TD
  Start([Bắt đầu ca trực]) --> CheckQueue{Kiểm tra hàng đợi waitingQueue}
  CheckQueue -- Hàng đợi rỗng --> SkipQueue[Không có xe chờ sạc]
  CheckQueue -- Còn xe trong hàng đợi --> ShiftVehicle[Dùng shift lấy xe đến sớm nhất vị trí 0]
  ShiftVehicle --> LogVehicle[In ra màn hình xe được điều phối]
  SkipQueue --> InitLoop[Khởi tạo completedSessionsKwh và totalKwh = 0]
  LogVehicle --> InitLoop
  InitLoop --> LoopCondition{Kiểm tra vòng lặp i < array.length?}
  LoopCondition -- Sai i >= length --> CalcRevenue[Tính tổng doanh thu totalRevenue = totalKwh * fastChargingRate]
  LoopCondition -- Đúng i < length --> AddKwh[Cộng dồn totalKwh += completedSessionsKwh[i]]
  AddKwh --> Increment[Tăng biến đếm i++]
  Increment --> LoopCondition
  CalcRevenue --> PrintResult[In ra Tổng sản lượng và Tổng doanh thu]
  PrintResult --> End([Kết thúc chương trình an toàn])
```

---

## Nhiệm vụ 1: Phân tích lỗi AS-IS và Lập bảng Test Cases

Sau khi ngồi đọc kỹ mã nguồn bài tập, mình nhận thấy có 2 lỗi logic nghiêm trọng ảnh hưởng trực tiếp đến nghiệp vụ điều phối xe tại trạm sạc VinFast:

Thứ nhất, việc sử dụng phương thức waitingQueue.pop() khiến cho chương trình lấy ra phần tử CUỐI CÙNG của mảng (tức là chiếc xe vừa mới đến sau cùng). Điều này vi phạm tuyệt đối nguyên tắc hàng đợi FIFO (First In First Out) của trạm sạc, nơi xe đến sớm nhất ở vị trí chỉ số 0 phải được ưu tiên phục vụ trước.

Thứ hai, trong vòng lặp tính tổng sản lượng điện tiêu thụ, điều kiện lặp i <= completedSessionsKwh.length vô tình làm cho vòng lặp chạy thêm một lần thừa thãi khi biến đếm i bằng chính chiều dài mảng. Lúc này, completedSessionsKwh[i] trả về giá trị undefined, khiến cho tổng totalKwh bị cộng dồn thành NaN (Not a Number) và kéo theo tổng doanh thu cũng bị hỏng hoàn toàn.

- Lỗi 1: Dùng pop() thay vì shift() làm đảo lộn thứ tự phục vụ xe vào trạm sạc.
- Lỗi 2: Dùng dấu bé hơn hoặc bằng (<= length) gây ra lỗi truy cập mảng vượt biên (out of bounds), sinh ra giá trị undefined và làm hỏng phép tính nhân doanh thu.

## Bảng Test Cases đối chứng lỗi và kết quả sửa đổi

Dưới đây là bảng phân tích 02 Test Cases chi tiết đối chứng giữa hiện trạng sai sót và kết quả đúng mong đợi sau khi fix code, bao gồm cả các ca kiểm thử biên (mảng rỗng, mảng 1 phần tử):

| Trường hợp kiểm thử | Dữ liệu đầu vào | Kết quả sai thực tế (AS-IS) | Kết quả đúng mong đợi (TO-BE) |
| --- | --- | --- | --- |
| TC 1: Điều phối xe chuẩn FIFO | waitingQueue = ['29A-112.33', '30E-889.12', '51K-678.99'] | Lấy ra '51K-678.99' (Xe đến cuối vào sạc trước - Sai nghiệp vụ) | Lấy ra '29A-112.33' (Xe ở vị trí index 0 vào sạc trước đúng chuẩn FIFO) |
| TC 2: Tính tổng sản lượng tiêu chuẩn | completedSessionsKwh = [45.2, 30.5, 62.8, 28.0] | totalKwh = NaN, totalRevenue = NaN (Do lỗi i <= length) | totalKwh = 166.5, totalRevenue = 749250 VNĐ |
| TC 3: Kiểm thử mảng rỗng | waitingQueue = [], completedSessionsKwh = [] | pop() trả về undefined, lỗi truy cập mảng | shift() trả về undefined (an toàn), totalKwh = 0, doanh thu = 0 VNĐ |
| TC 4: Kiểm thử mảng 1 phần tử | waitingQueue = ['30A-999.99'], completedSessionsKwh = [50.0] | pop() lấy đúng nhưng vòng lặp vẫn duyệt 2 lần gây NaN | shift() lấy đúng '30A-999.99', totalKwh = 50.0, doanh thu = 225000 VNĐ |

## Nhiệm vụ 2: Sửa lỗi mã nguồn

Mình đã tiến hành viết lại toàn bộ mã nguồn vào tệp solution_ex1.js theo đúng yêu cầu kỹ thuật. Đã thay thế hoàn toàn phương thức pop() bằng shift() để bám sát nguyên tắc FIFO, đồng thời sửa lại điều kiện vòng lặp từ i <= array.length thành i < array.length để triệt tiêu hoàn toàn hiện tượng NaN.

- Đảm bảo mã chạy mượt mà, không còn lỗi runtime hay sai lệch dữ liệu.
- Tuân thủ tuyệt đối các quy định đặt tên và cấu trúc nộp bài.

---

## 📁 Danh sách tệp tin nộp bài trong Repository
- 📝 `bt1.docx`: Báo cáo tài liệu phân tích nghiệp vụ hoàn chỉnh.
- 🎨 `bt1.drawio`: File thiết kế sơ đồ chuẩn theo quy định đề bài (mở trực tiếp bằng [Draw.io](https://app.diagrams.net) hoặc Lucidchart).
- 💻 `solution_ex1.js`: Mã nguồn chương trình.
