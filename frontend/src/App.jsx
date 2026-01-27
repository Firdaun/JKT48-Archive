export default function App() {
    const photos = [
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/oline_manuel.jpg' },
        { src: 'src/assets/christy1.jpg' },
        { src: 'src/assets/christy2.jpg' },
        { src: 'src/assets/christy3.jpg' },
        { src: 'src/assets/christy4.jpg' },
        { src: 'src/assets/christy1.jpg' },
    ]
    return (
        <>
            <div className="gap-20 flex m-auto justify-center items-center p-3">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src="src/assets/oline_manuel.jpg" alt="" />
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src="src/assets/oline_manuel.jpg" alt="" />
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src="src/assets/oline_manuel.jpg" alt="" />
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src="src/assets/oline_manuel.jpg" alt="" />
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src="src/assets/oline_manuel.jpg" alt="" />
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src="src/assets/oline_manuel.jpg" alt="" />
                </div>
                <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src="src/assets/oline_manuel.jpg" alt="" />
                </div>
            </div>
            <div className="h-30 flex justify-evenly border-t border-slate-500 items-center">
                <div>
                    <h1>Instagram</h1>
                    <div className="w-full h-0.5 bg-slate-500"></div>
                </div>
                <div>
                    <h1>Tiktok</h1>
                </div>
                <div>
                    <h1>Twitter</h1>
                </div>
            </div>
            <div className="flex px-5 flex-wrap gap-3">
                {photos.map((item, index) => (
                    <img key={index} className="h-48 w-auto object-cover rounded-lg" src={item.src} alt="" />
                ))}
            </div>
        </>
    )
}