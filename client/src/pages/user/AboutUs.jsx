import React from "react";
import "../../css/aboutus.css";
// client\src\assets\images\designer.jpg
import image1 from "../../assets/images/designer.jpg";
import vision from "../../assets/images/vision.png";
import mission from "../../assets/images/mission.webp";
import forest from "../../assets/images/forest.jpg";
import quality from "../../assets/images/quality.jpg";
import value from "../../assets/images/giatricotloi.jpg";

const AboutUs = () => {
    return (
        <div className="ContentsAboutUs" style={{width: '100%',height: 'auto', padding: '20px', textAlign: 'center' }}>
            <h1>Giới Thiệu Về Nội Thất Harmony</h1>
            <table className="introduction">
                <tr>
                    <td>
                        <div className="Designer">
                            <img src={image1} alt="Harmony Furniture" /> 
                        </div>
                    </td>
                    <td>
                        <div className="contents" style={{width: '100%'}} > {/* 50% bên phải */}
                            <p style={{fontSize: '25px'}}>
                                Harmony Furniture là một thương hiệu nội thất hàng đầu, chuyên cung cấp các sản phẩm chất lượng cao với thiết kế tinh tế và hiện đại. Chúng tôi cam kết mang đến cho khách hàng những trải nghiệm mua sắm tuyệt vời và sản phẩm nội thất đẹp mắt, bền bỉ.
                            </p>

                            <p style={{fontSize: '25px'}}>
                                Với đội ngũ thiết kế sáng tạo và đội ngũ chăm sóc khách hàng tận tâm, chúng tôi luôn nỗ lực để đáp ứng mọi nhu cầu của khách hàng và mang đến sự hài lòng tối đa. Hãy cùng chúng tôi tạo nên không gian sống hoàn hảo cho bạn và gia đình!
                            </p>
                            <ul>
                                <li>
                                    <b>An Toàn và Bên Bỉ:</b> Tất cả các sản phẩm của chúng tôi đều được làm từ vật liệu an toàn và bền bỉ, đảm bảo sức khỏe và sự thoải mái cho gia đình bạn. Chúng tôi cam kết sử dụng các vật liệu thân thiện với môi trường và tuân thủ các tiêu chuẩn chất lượng nghiêm ngặt để đảm bảo rằng mỗi sản phẩm đều đạt được độ bền và an toàn cao nhất.
                                </li>
                                <li>
                                    <b>Giá Cả Hợp Lý:</b> Chúng tôi cam kết cung cấp các sản phẩm nội thất chất lượng cao với giá cả cạnh tranh, giúp khách hàng có thể sở hữu không gian sống đẹp mắt mà không cần phải chi tiêu quá nhiều.
                                </li>
                                <li>
                                    <b>Dịch Vụ Chăm Sóc Khách Hàng Tận Tâm:</b> Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ bạn trong mọi bước của quá trình mua sắm, từ tư vấn sản phẩm đến hỗ trợ sau bán hàng. Chúng tôi cam kết mang đến cho khách hàng sự hài lòng tối đa và trải nghiệm mua sắm tuyệt vời.
                                </li>
                                <li>
                                    <b>Đẹp và Hiện Đại:</b> Tất cả các sản phẩm của chúng tôi đều được thiết kế với phong cách hiện đại, mang lại vẻ đẹp sang trọng và đẳng cấp cho không gian sống của bạn. Chúng tôi luôn cập nhật xu hướng thiết kế mới nhất để đảm bảo rằng khách hàng của chúng tôi luôn có những lựa chọn nội thất đẹp mắt và phù hợp với phong cách sống của họ.
                                </li>
                                <li>
                                    <b>Đa Dạng Sản Phẩm:</b> Chúng tôi cung cấp một loạt các sản phẩm nội thất đa dạng, từ bàn ghế, giường ngủ, tủ quần áo đến các phụ kiện trang trí, giúp khách hàng có thể dễ dàng tìm thấy những sản phẩm phù hợp với nhu cầu và sở thích của mình.
                                </li>
                            </ul>
                        </div>
                    </td>
                </tr>
            </table>
            <table style={{ margin: '20px auto', borderCollapse: 'collapse', width: '80%' }}>
                <tr>   {/* Hàng 1 */}
                    <td> {/* Cột 1 bên trái */}
                        <h1>Tầm Nhìn</h1> 
                        <p>
                            Harmory mong muốn trở thành thương hiệu nội thất hàng đầu tại Việt Nam, được biết đến với chất lượng sản phẩm xuất sắc, thiết kế sáng tạo và dịch vụ khách hàng tận tâm. Chúng tôi hướng tới việc tạo ra những không gian sống đẹp mắt và tiện nghi cho khách hàng của mình, đồng thời đóng góp vào sự phát triển bền vững của ngành nội thất.
                        </p>
                    </td>
                    <td> {/* Cột 2 bên phải */}
                        <img src={vision} alt="Vision Image" style={{ width: '100%', height: 'auto' }} />
                    </td>
                </tr>
                <tr>   {/* Hàng 2 */}
                    <td> {/* Cột 1 bên trái */}
                        <img src={mission} alt="Mission Image" style={{ width: '100%', height: 'auto' }} />
                    </td>
                    <td> {/* Cột 2 bên phải */}
                        <h1>Sứ Mệnh</h1>
                        <p>
                            Sứ mệnh của Harmory là cung cấp các sản phẩm nội thất chất lượng cao, thiết kế đẹp mắt và dịch vụ khách hàng xuất sắc. Chúng tôi cam kết mang đến cho khách hàng những trải nghiệm mua sắm tuyệt vời và sản phẩm nội thất bền bỉ, giúp họ tạo ra không gian sống hoàn hảo cho gia đình mình.
                        </p>
                    </td>
                </tr>
                <tr>   {/* Hàng 3 */}
                    <td> {/* Chỉ một cột */}
                        <h1>Giá Trị Cốt Lõi</h1>
                        <p><b>Chất Lượng:</b> Chúng tôi cam kết cung cấp các sản phẩm nội thất chất lượng cao, được làm từ vật liệu an toàn và bền bỉ, đảm bảo sức khỏe và sự thoải mái cho khách hàng.</p>
                        <p><b>Đổi Mới:</b> Chúng tôi luôn nỗ lực đổi mới và sáng tạo trong thiết kế sản phẩm để đáp ứng nhu cầu ngày càng đa dạng của khách hàng.</p>
                        <p><b>Tận Tâm:</b> Đội ngũ chăm sóc khách hàng của chúng tôi luôn sẵn sàng hỗ trợ và mang đến sự hài lòng tối đa cho khách hàng.</p>
                        <p><b>Bền Vững:</b> Chúng tôi cam kết sử dụng các vật liệu thân thiện với môi trường và tuân thủ các tiêu chuẩn chất lượng nghiêm ngặt để đảm bảo rằng mỗi sản phẩm đều đạt được độ bền và an toàn cao nhất.</p>
                        <p><b>Đẹp và Hiện Đại:</b> Tất cả các sản phẩm của chúng tôi đều được thiết kế với phong cách hiện đại, mang lại vẻ đẹp sang trọng và đẳng cấp cho không gian sống của khách hàng.</p>
                    </td>
                    <td>
                        <img src={value} alt="Core Values Image" style={{ width: '100%', height: 'auto' }} />
                    </td>
                </tr>
                <tr>   {/* Hàng 4 */}
                    <td className="antoan">
                        <h1>An Toàn Cho Sức Khỏe Người Dùng</h1>
                        <p>
                            Chúng tôi cam kết sử dụng các vật liệu an toàn và thân thiện với môi trường trong tất cả các sản phẩm của mình, đảm bảo rằng khách hàng có thể yên tâm về sức khỏe và sự an toàn của gia đình khi sử dụng sản phẩm của chúng tôi. Đạt nhiều chứng nhận chất lượng và an toàn, chúng tôi luôn đặt sức khỏe của khách hàng lên hàng đầu trong quá trình sản xuất và thiết kế sản phẩm. Mang lại cho khách hàng sự an tâm tuyệt đối khi sử dụng sản phẩm nội thất của chúng tôi trong không gian sống của họ.
                        </p>
                    </td>
                </tr>
                <tr>   {/* Hàng 5 */}
                    <td> {/*   Cột bên trái */}
                        <h1>Thân Thiện Với Môi Trường</h1>
                        <p>
                            Chúng tôi cam kết sử dụng các vật liệu thân thiện với môi trường và tuân thủ các tiêu chuẩn chất lượng nghiêm ngặt để đảm bảo rằng mỗi sản phẩm đều đạt được độ bền và an toàn cao nhất. Chúng tôi cũng khuyến khích khách hàng tái chế và tái sử dụng sản phẩm của chúng tôi để giảm thiểu tác động đến môi trường.
                        </p>
                    </td>
                    <td> {/* Cột bên phải */}
                        <img src={forest} alt="Environmentally Friendly Image" style={{ width: '100%', height: 'auto' }} />
                    </td>
                </tr>
                <tr>   {/* Hàng 6 */}
                    <td>
                        <img src={quality} alt="Customer Service Image" style={{ width: '100%', height: 'auto' }} />
                    </td>
                    <td>
                        <h1>Chất Lượng Đạt Chuẩn Quốc Tế</h1>
                        <p>
                            Sản phẩm của Harmory được sản xuất với quy trình kiểm tra chất lượng nghiêm ngặt, đảm bảo rằng mỗi sản phẩm đều đạt được tiêu chuẩn quốc tế về chất lượng và an toàn. Chúng tôi cam kết mang đến cho khách hàng những sản phẩm nội thất bền bỉ, đẹp mắt và an toàn, giúp họ tạo ra không gian sống hoàn hảo cho gia đình mình.
                        </p>
                    </td>
                </tr>
                <tr>   {/* Hàng 7 */}
                    <td>
                        <h1>Lời Cam Kết Của Chúng Tôi</h1>
                        <p>
                            Chúng tôi cam kết mang đến cho khách hàng những sản phẩm nội thất chất lượng cao, dịch vụ chăm sóc khách hàng tận tâm và chính sách bảo hành uy tín. Với sự phát triển không ngừng, Harmory luôn nỗ lực để trở thành lựa chọn hàng đầu của khách hàng trong việc tạo nên không gian sống hoàn hảo. Nguyên liệu được nhập khẩu từ nước ngoài, đảm bảo chất lượng và độ bền cao. 
                        </p> <br></br>
                        <p>Chúng tôi muốn truyển tải lối sống tối giản sang trọng và hiện đại được làm từ các sản phẩm thân thiện với môi trường. Giúp kiến tạo tương lại xanh, cân bằng và lành mạnh</p>
                    </td>
                </tr>
            </table>
        </div>
    );
};  
export default AboutUs;