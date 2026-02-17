import { useQuery } from '@tanstack/react-query'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { photoApi } from './lib/photo-api'
import { useSearchParams } from 'react-router'
const API_URL = import.meta.env.VITE_BACKEND_URL
const isVideoFile = (url, type) => {
    return type === 'VIDEO' || (url && url.endsWith('.mp4'));
}
const photoProfile = [
    { src: '/kabesha/abigail_rachel.jpg', name: 'aralie' },
    { src: '/kabesha/adeline_wijaya.jpg', name: 'delynn' },
    { src: '/kabesha/alya_amanda.jpg', name: 'alya' },
    { src: '/kabesha/amanda_sukma.jpg', name: 'amanda' },
    { src: '/kabesha/angelina_christy.jpg', name: 'christy' },
    { src: '/kabesha/anindya_ramadhani.jpg', name: 'anin' },
    { src: '/kabesha/astrella_virgiananda.jpg', name: 'virgi' },
    { src: '/kabesha/aulia_riza.jpg', name: 'auwia' },
    { src: '/kabesha/aurellia.jpg', name: 'lia' },
    { src: '/kabesha/aurhel_alana.jpg', name: 'lana' },
    { src: '/kabesha/bong_aprilli.jpg', name: 'rily' },
    { src: '/kabesha/catherina_vallencia.jpg', name: 'erine' },
    { src: '/kabesha/cathleen_nixie.jpg', name: 'cathy' },
    { src: '/kabesha/celline_thefani.jpg', name: 'elin' },
    { src: '/kabesha/chelsea_davina.jpg', name: 'chelsea' },
    { src: '/kabesha/cornelia_vanisa.jpg', name: 'oniel' },
    { src: '/kabesha/cynthia_yaputera.jpg', name: 'cynthia' },
    { src: '/kabesha/dena_natalia.jpg', name: 'dena' },
    { src: '/kabesha/desy_natalia.jpg', name: 'desy' },
    { src: '/kabesha/febriola_sinambela.jpg', name: 'olla' },
    { src: '/kabesha/feni_fitriyanti.jpg', name: 'feni' },
    { src: '/kabesha/fiony_alveria.jpg', name: 'fiony' },
    { src: '/kabesha/freya_jayawardana.jpg', name: 'freya' },
    { src: '/kabesha/fritzy_rosmerian.jpg', name: 'fritzy' },
    { src: '/kabesha/gabriela_abigail.jpg', name: 'ella' },
    { src: '/kabesha/gendis_mayrannisa.jpg', name: 'gendis' },
    { src: '/kabesha/gita_sekar_andarini.jpg', name: 'gita' },
    { src: '/kabesha/grace_octaviani.jpg', name: 'gracie' },
    { src: '/kabesha/greesella_adhalia.jpg', name: 'greesel' },
    { src: '/kabesha/hagia_sopia.jpg', name: 'gia' },
    { src: '/kabesha/helisma_putri.jpg', name: 'eli' },
    { src: '/kabesha/hillary_abigail.jpg', name: 'lily' },
    { src: '/kabesha/humaira_ramadhani.jpg', name: 'maira' },
    { src: '/kabesha/indah_cahya.jpg', name: 'indah' },
    { src: '/kabesha/jacqueline_immanuela.jpg', name: 'ekin' },
    { src: '/kabesha/jazzlyn_trisha.jpg', name: 'trisha' },
    { src: '/kabesha/jemima_evodie.jpg', name: 'jemima' },
    { src: '/kabesha/jessica_chandra.jpg', name: 'jessi' },
    { src: '/kabesha/jesslyn_elly.jpg', name: 'lyn' },
    { src: '/kabesha/kathrina_irene.jpg', name: 'katrina' },
    { src: '/kabesha/lulu_salsabila.jpg', name: 'lulu' },
    { src: '/kabesha/marsha_lenathea.jpg', name: 'marsha' },
    { src: '/kabesha/michelle_alexandra.jpg', name: 'michie' },
    { src: '/kabesha/michelle_levia.jpg', name: 'levi' },
    { src: '/kabesha/mikaela_kusjanto.jpg', name: 'mikaela' },
    { src: '/kabesha/mutiara_azzahra.jpg', name: 'muthe' },
    { src: '/kabesha/nayla_suji.jpg', name: 'nayla' },
    { src: '/kabesha/nina_tutachia.jpg', name: 'nachia' },
    { src: '/kabesha/nur_intan.jpg', name: 'intan' },
    { src: '/kabesha/oline_manuel.jpg', name: 'oline' },
    { src: '/kabesha/raisha_syifa.jpg', name: 'raisha' },
    { src: '/kabesha/ribka_budiman.jpg', name: 'ribka' },
    { src: '/kabesha/shabilqis_naila.jpg', name: 'nala' },
    { src: '/kabesha/victoria_kimberly.jpg', name: 'kimmy' }
]
const platforms = [
    {
        id: 'instagram',
        label: 'Instagram',
        icon: (<svg width="35" height="35" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint0_radial_87_7153)"></rect> <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint1_radial_87_7153)"></rect> <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint2_radial_87_7153)"></rect> <path d="M23 10.5C23 11.3284 22.3284 12 21.5 12C20.6716 12 20 11.3284 20 10.5C20 9.67157 20.6716 9 21.5 9C22.3284 9 23 9.67157 23 10.5Z" fill="white"></path> <path fillRule="evenodd" clipRule="evenodd" d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z" fill="white"></path> <path fillRule="evenodd" clipRule="evenodd" d="M6 15.6C6 12.2397 6 10.5595 6.65396 9.27606C7.2292 8.14708 8.14708 7.2292 9.27606 6.65396C10.5595 6 12.2397 6 15.6 6H16.4C19.7603 6 21.4405 6 22.7239 6.65396C23.8529 7.2292 24.7708 8.14708 25.346 9.27606C26 10.5595 26 12.2397 26 15.6V16.4C26 19.7603 26 21.4405 25.346 22.7239C24.7708 23.8529 23.8529 24.7708 22.7239 25.346C21.4405 26 19.7603 26 16.4 26H15.6C12.2397 26 10.5595 26 9.27606 25.346C8.14708 24.7708 7.2292 23.8529 6.65396 22.7239C6 21.4405 6 19.7603 6 16.4V15.6ZM15.6 8H16.4C18.1132 8 19.2777 8.00156 20.1779 8.0751C21.0548 8.14674 21.5032 8.27659 21.816 8.43597C22.5686 8.81947 23.1805 9.43139 23.564 10.184C23.7234 10.4968 23.8533 10.9452 23.9249 11.8221C23.9984 12.7223 24 13.8868 24 15.6V16.4C24 18.1132 23.9984 19.2777 23.9249 20.1779C23.8533 21.0548 23.7234 21.5032 23.564 21.816C23.1805 22.5686 22.5686 23.1805 21.816 23.564C21.5032 23.7234 21.0548 23.8533 20.1779 23.9249C19.2777 23.9984 18.1132 24 16.4 24H15.6C13.8868 24 12.7223 23.9984 11.8221 23.9249C10.9452 23.8533 10.4968 23.7234 10.184 23.564C9.43139 23.1805 8.81947 22.5686 8.43597 21.816C8.27659 21.5032 8.14674 21.0548 8.0751 20.1779C8.00156 19.2777 8 18.1132 8 16.4V15.6C8 13.8868 8.00156 12.7223 8.0751 11.8221C8.14674 10.9452 8.27659 10.4968 8.43597 10.184C8.81947 9.43139 9.43139 8.81947 10.184 8.43597C10.4968 8.27659 10.9452 8.14674 11.8221 8.0751C12.7223 8.00156 13.8868 8 15.6 8Z" fill="white"></path> <defs> <radialGradient id="paint0_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)"> <stop stopColor="#B13589"></stop> <stop offset="0.79309" stopColor="#C62F94"></stop> <stop offset="1" stopColor="#8A3AC8"></stop> </radialGradient> <radialGradient id="paint1_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)"> <stop stopColor="#E0E8B7"></stop> <stop offset="0.444662" stopColor="#FB8A2E"></stop> <stop offset="0.71474" stopColor="#E2425C"></stop> <stop offset="1" stopColor="#E2425C" stopOpacity="0"></stop> </radialGradient> <radialGradient id="paint2_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.500002 3) rotate(-8.1301) scale(38.8909 8.31836)"> <stop offset="0.156701" stopColor="#406ADC"></stop> <stop offset="0.467799" stopColor="#6A45BE"></stop> <stop offset="1" stopColor="#6A45BE" stopOpacity="0"></stop> </radialGradient> </defs> </g></svg>)
    },
    {
        id: 'tiktok',
        label: 'TikTok',
        icon: (<svg width="37" height="37" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8.45095 19.7926C8.60723 18.4987 9.1379 17.7743 10.1379 17.0317C11.5688 16.0259 13.3561 16.5948 13.3561 16.5948V13.2197C13.7907 13.2085 14.2254 13.2343 14.6551 13.2966V17.6401C14.6551 17.6401 12.8683 17.0712 11.4375 18.0775C10.438 18.8196 9.90623 19.5446 9.7505 20.8385C9.74562 21.5411 9.87747 22.4595 10.4847 23.2536C10.3345 23.1766 10.1815 23.0889 10.0256 22.9905C8.68807 22.0923 8.44444 20.7449 8.45095 19.7926ZM22.0352 6.97898C21.0509 5.90039 20.6786 4.81139 20.5441 4.04639H21.7823C21.7823 4.04639 21.5354 6.05224 23.3347 8.02482L23.3597 8.05134C22.8747 7.7463 22.43 7.38624 22.0352 6.97898ZM28 10.0369V14.293C28 14.293 26.42 14.2312 25.2507 13.9337C23.6179 13.5176 22.5685 12.8795 22.5685 12.8795C22.5685 12.8795 21.8436 12.4245 21.785 12.3928V21.1817C21.785 21.6711 21.651 22.8932 21.2424 23.9125C20.709 25.246 19.8859 26.1212 19.7345 26.3001C19.7345 26.3001 18.7334 27.4832 16.9672 28.28C15.3752 28.9987 13.9774 28.9805 13.5596 28.9987C13.5596 28.9987 11.1434 29.0944 8.96915 27.6814C8.49898 27.3699 8.06011 27.0172 7.6582 26.6277L7.66906 26.6355C9.84383 28.0485 12.2595 27.9528 12.2595 27.9528C12.6779 27.9346 14.0756 27.9528 15.6671 27.2341C17.4317 26.4374 18.4344 25.2543 18.4344 25.2543C18.5842 25.0754 19.4111 24.2001 19.9423 22.8662C20.3498 21.8474 20.4849 20.6247 20.4849 20.1354V11.3475C20.5435 11.3797 21.2679 11.8347 21.2679 11.8347C21.2679 11.8347 22.3179 12.4734 23.9506 12.8889C25.1204 13.1864 26.7 13.2483 26.7 13.2483V9.91314C27.2404 10.0343 27.7011 10.0671 28 10.0369Z" fill="#EE1D52"></path> <path d="M26.7009 9.91314V13.2472C26.7009 13.2472 25.1213 13.1853 23.9515 12.8879C22.3188 12.4718 21.2688 11.8337 21.2688 11.8337C21.2688 11.8337 20.5444 11.3787 20.4858 11.3464V20.1364C20.4858 20.6258 20.3518 21.8484 19.9432 22.8672C19.4098 24.2012 18.5867 25.0764 18.4353 25.2553C18.4353 25.2553 17.4337 26.4384 15.668 27.2352C14.0765 27.9539 12.6788 27.9357 12.2604 27.9539C12.2604 27.9539 9.84473 28.0496 7.66995 26.6366L7.6591 26.6288C7.42949 26.4064 7.21336 26.1717 7.01177 25.9257C6.31777 25.0795 5.89237 24.0789 5.78547 23.7934C5.78529 23.7922 5.78529 23.791 5.78547 23.7898C5.61347 23.2937 5.25209 22.1022 5.30147 20.9482C5.38883 18.9122 6.10507 17.6625 6.29444 17.3494C6.79597 16.4957 7.44828 15.7318 8.22233 15.0919C8.90538 14.5396 9.6796 14.1002 10.5132 13.7917C11.4144 13.4295 12.3794 13.2353 13.3565 13.2197V16.5948C13.3565 16.5948 11.5691 16.028 10.1388 17.0317C9.13879 17.7743 8.60812 18.4987 8.45185 19.7926C8.44534 20.7449 8.68897 22.0923 10.0254 22.991C10.1813 23.0898 10.3343 23.1775 10.4845 23.2541C10.7179 23.5576 11.0021 23.8221 11.3255 24.0368C12.631 24.8632 13.7249 24.9209 15.1238 24.3842C16.0565 24.0254 16.7586 23.2167 17.0842 22.3206C17.2888 21.7611 17.2861 21.1978 17.2861 20.6154V4.04639H20.5417C20.6763 4.81139 21.0485 5.90039 22.0328 6.97898C22.4276 7.38624 22.8724 7.7463 23.3573 8.05134C23.5006 8.19955 24.2331 8.93231 25.1734 9.38216C25.6596 9.61469 26.1722 9.79285 26.7009 9.91314Z" fill="#000000"></path> <path d="M4.48926 22.7568V22.7594L4.57004 22.9784C4.56076 22.9529 4.53074 22.8754 4.48926 22.7568Z" fill="#69C9D0"></path> <path d="M10.5128 13.7916C9.67919 14.1002 8.90498 14.5396 8.22192 15.0918C7.44763 15.7332 6.79548 16.4987 6.29458 17.354C6.10521 17.6661 5.38897 18.9168 5.30161 20.9528C5.25223 22.1068 5.61361 23.2983 5.78561 23.7944C5.78543 23.7956 5.78543 23.7968 5.78561 23.798C5.89413 24.081 6.31791 25.0815 7.01191 25.9303C7.2135 26.1763 7.42963 26.4111 7.65924 26.6334C6.92357 26.1457 6.26746 25.5562 5.71236 24.8839C5.02433 24.0451 4.60001 23.0549 4.48932 22.7626C4.48919 22.7605 4.48919 22.7584 4.48932 22.7564V22.7527C4.31677 22.2571 3.95431 21.0651 4.00477 19.9096C4.09213 17.8736 4.80838 16.6239 4.99775 16.3108C5.4985 15.4553 6.15067 14.6898 6.92509 14.0486C7.608 13.4961 8.38225 13.0567 9.21598 12.7484C9.73602 12.5416 10.2778 12.3891 10.8319 12.2934C11.6669 12.1537 12.5198 12.1415 13.3588 12.2575V13.2196C12.3808 13.2349 11.4148 13.4291 10.5128 13.7916Z" fill="#69C9D0"></path> <path d="M20.5438 4.04635H17.2881V20.6159C17.2881 21.1983 17.2881 21.76 17.0863 22.3211C16.7575 23.2167 16.058 24.0253 15.1258 24.3842C13.7265 24.923 12.6326 24.8632 11.3276 24.0368C11.0036 23.823 10.7187 23.5594 10.4844 23.2567C11.5962 23.8251 12.5913 23.8152 13.8241 23.341C14.7558 22.9821 15.4563 22.1734 15.784 21.2774C15.9891 20.7178 15.9864 20.1546 15.9864 19.5726V3H20.4819C20.4819 3 20.4315 3.41188 20.5438 4.04635ZM26.7002 8.99104V9.9131C26.1725 9.79263 25.6609 9.61447 25.1755 9.38213C24.2352 8.93228 23.5026 8.19952 23.3594 8.0513C23.5256 8.1559 23.6981 8.25106 23.8759 8.33629C25.0192 8.88339 26.1451 9.04669 26.7002 8.99104Z" fill="#69C9D0"></path> </g></svg>)
    },
    {
        id: 'twitter',
        label: 'X (Twitter)',
        icon: (<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#000000" viewBox="0 0 256 256"><path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z"></path></svg>)
    }
]
export default function App() {
    const [searchParams, setSearchParams] = useSearchParams()

    const source = searchParams.get('source') || ''
    const nickname = searchParams.get('nickname') || ''
    const page = parseInt(searchParams.get('page') || '1')

    const [searchInput, setSearchInput] = useState(nickname)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)
    const [selectedImage, setSelectedImage] = useState(null)
    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [viewMode, setViewMode] = useState('photo')
    const [selectedPostUrl, setSelectedPostUrl] = useState(null)
    const currentMode = selectedPostUrl ? 'photo' : viewMode

    const photoQueryParams = {
        page: page,
        size: currentMode === 'album' ? 8 : 40,
        source: source,
        nickname: nickname,
        mode: currentMode,
        post_url: selectedPostUrl || ''
    }

    const imgQuery = useQuery({
        queryKey: ['public-photos', photoQueryParams],
        queryFn: () => photoApi.getPublicPhotos(photoQueryParams),
        staleTime: 1000 * 60 * 15,
        gcTime: 1000 * 60 * 30,
    })

    const photos = imgQuery.data?.data || []
    const paging = imgQuery.data?.paging
    const maxPage = paging?.total_page || 1

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        containScroll: false,
        dragFree: true
    })

    const scrollToIndex = useCallback((index) => {
        if (emblaApi) {
            emblaApi.scrollTo(index)
            setSelectedIndex(index)
        }
    }, [emblaApi])

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= maxPage) {

            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev)
                newParams.set('page', newPage)
                return newParams
            })
        }
    }

    const createNicknameParams = (prevParams, newNickname) => {
        const newParams = new URLSearchParams(prevParams)

        if (newNickname) {
            newParams.set('nickname', newNickname)
        } else {
            newParams.delete('nickname')
        }
        newParams.set('page', 1)

        return newParams
    }

    const handleMemberClick = (index, memberName) => {
        scrollToIndex(index)
        setSearchInput(memberName)
        setSearchParams(prev => createNicknameParams(prev, memberName))
    }

    const handleClear = () => {
        setSearchInput('')
        setSelectedIndex(-1)
        setSearchParams({})
        setSelectedPostUrl(null)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            const foundIndex = photoProfile.findIndex(member => member.name.toLowerCase() === searchInput.toLowerCase().trim())
            foundIndex !== -1 && scrollToIndex(foundIndex)
            setSearchParams(prev => (prev.get('nickname') || '') !== searchInput ? createNicknameParams(prev, searchInput) : prev, { replace: true })
        }, 500)
        return () => clearTimeout(handler)
    }, [searchInput, scrollToIndex, setSearchParams])

    return (
        <div className='h-screen flex flex-col'>
            <div className="overflow-hidden bg-gray-800 p-3 select-none" ref={emblaRef}>
                <div className='h-25 flex'>
                    {photoProfile.map((itemsp, indexp) => (
                        <div key={indexp} onClick={() => handleMemberClick(indexp, itemsp.name)} className={`${indexp === selectedIndex ? 'ring-4 ring-[#EE1D52] opacity-100 shadow-lg' : 'opacity-50 hover:opacity-100'} h-20 rounded-full ml-4`}>
                            <div className='w-20 h-full rounded-full overflow-hidden'>
                                <img src={itemsp.src} alt={itemsp.name} />
                            </div>
                            <p className='text-xs mt-1 flex items-center justify-center text-white font-bold'>{itemsp.name}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between">
                <div className='flex gap-5 items-center pl-3'>
                    <h1 className='whitespace-nowrap'>selected: {photoQueryParams.nickname}</h1>
                    <div className='flex items-center gap-2'>
                        <h1 className='whitespace-nowrap'>tampilan: </h1>
                        <div
                            onClick={() => {
                                const newMode = viewMode === 'photo' ? 'album' : 'photo'
                                setViewMode(newMode)
                                setSelectedPostUrl(null)
                                setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', 1); return n })
                            }}

                            className='bg-gray-300 cursor-pointer select-none w-25 p-2 items-center flex justify-center rounded-md'>
                            <span className="text-sm font-bold">{viewMode === 'album' ? '📚 Album' : '🖼️ Foto'}</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${viewMode === 'album' ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className='flex items-center w-full justify-evenly'>
                    {platforms.map((platform) => (
                        <div key={platform.id}
                            onClick={() => setSearchParams(prev => {
                                const newParams = new URLSearchParams(prev);

                                if (newParams.get('source') === platform.id) {
                                    newParams.delete('source')
                                } else {
                                    newParams.set('source', platform.id)
                                }

                                newParams.set("page", 1)
                                return newParams
                            })}>
                            <div>{platform.icon}</div>
                            <div className={`h-1 w-full rounded-full transition-all duration-300 ${photoQueryParams.source === platform.id ? 'bg-gray-800 scale-100' : 'bg-transparent scale-0'}`}></div>
                        </div>
                    ))}
                </div>
                <div className='p-2.5 pl-0 flex relative justify-end items-end'>
                    {(source || nickname) && (
                        <div onClick={handleClear} className='absolute flex -left-25 hover:bg-slate-200 cursor-pointer border-slate-300 text-slate-700 items-center h-10 mr-5 border w-20 rounded-lg justify-center'>
                            <h1>clear</h1>
                        </div>
                    )}
                    <div className='border gap-3 h-10 flex rounded-lg items-center overflow-hidden border-slate-300'>
                        <div className='h-full flex items-center px-2'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="oklch(70.4% 0.04 256.788)" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                        </div>
                        <input
                            type="text"
                            ref={inputRef}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder='search member...'
                            className='w-40 h-10 rounded-lg placeholder:text-slate-400 text-sm focus:outline-none'
                        />
                    </div>
                </div>
            </div>
            <div className='flex-1 overflow-y-auto'>
                {imgQuery.isFetching ? (
                    <div className="col-span-full py-10 text-center text-black">
                        <p className="animate-pulse">Loading data...</p>
                    </div>
                ) : currentMode === 'album' ? (
                    <div className="grid grid-cols-1 p-15 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {photos.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setSelectedPostUrl(item.postUrl)
                                    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', 1); return n })
                                }}
                                className="group cursor-pointer relative p-2">
                                <div className="absolute top-0 right-0 left-4 bottom-4 bg-gray-300 rounded-lg transform rotate-6 transition-transform group-hover:rotate-12 border border-gray-400 shadow-sm"></div>
                                <div className="absolute top-2 right-2 left-2 bottom-2 bg-gray-200 rounded-lg transform rotate-3 transition-transform group-hover:rotate-6 border border-gray-300 shadow-sm"></div>

                                <div className="relative aspect-square bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 z-10">
                                    {isVideoFile(item.srcUrl, item.mediaType) ? (
                                        <div className="w-full h-full relative">
                                            <video
                                                src={`${API_URL}${item.srcUrl}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                muted
                                                playsInline
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="white" viewBox="0 0 256 256"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path></svg>
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={`${API_URL}${item.srcUrl}`} alt="cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                                    )}
                                    <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-lg text-white backdrop-blur-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M216,72H130.67L102.93,44.26A16.16,16.16,0,0,0,91.62,39.58L40,40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Zm0,128H40V56l51.62-.42L120,84.69V88H216Zm-56-80a8,8,0,0,1,8,8v16h16a8,8,0,0,1,0,16H168v16a8,8,0,0,1-16,0V144H136a8,8,0,0,1,0-16h16V128A8,8,0,0,1,160,120Z"></path></svg>
                                    </div>
                                </div>

                                <div className="mt-3 px-1 relative z-20">
                                    <p className="font-bold text-gray-800 text-sm line-clamp-1">
                                        {new Date(item.postedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-gray-500 text-xs line-clamp-2 mt-1">
                                        {item.caption || "Tanpa Caption"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-10 gap-1">
                        {selectedPostUrl && (
                            <div
                                onClick={() => {
                                    setSelectedPostUrl(null)
                                    setSearchParams(prev => { const n = new URLSearchParams(prev); n.set('page', 1); return n })
                                }}
                                className="col-span-1 aspect-square bg-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-300 transition text-slate-600 rounded-lg border border-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z"></path></svg>
                                <span className="text-xs font-bold mt-2">KEMBALI</span>
                            </div>
                        )}

                        {photos.map((items) => (
                            <div key={items.id} onClick={() => setSelectedImage(items)} className="relative aspect-square group cursor-zoom-in">
                                {isVideoFile(items.srcUrl, items.mediaType) ? (
                                    <>
                                        <video
                                            className="w-full h-full object-cover"
                                            src={`${API_URL}${items.srcUrl}`}
                                            muted
                                            playsInline
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-black/50 rounded-full p-2 text-white">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path></svg>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <img className="w-full h-full object-cover" src={`${API_URL}${items.srcUrl}`} alt={items.caption || "Foto JKT48"} />
                                )}
                                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40"></div>
                                <div className="absolute z-10 top-0 right-0 rounded-bl-md hover:bg-black/50 text-white opacity-0 cursor-pointer group-hover:opacity-100"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" viewBox="0 0 256 256"><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM128,72a12,12,0,1,0-12-12A12,12,0,0,0,128,72Zm0,112a12,12,0,1,0,12,12A12,12,0,0,0,128,184Z"></path></svg></div>
                            </div>
                        ))}
                    </div>
                )}

                {!imgQuery.isFetching && photos.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        <p>Tidak ada foto ditemukan.</p>
                    </div>
                )}
            </div>
            <div className="p-1 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                    Total: <span className="font-semibold">
                        {paging?.total_item || 0}
                    </span> {currentMode === 'album' ? 'albums' : 'photos'}
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="p-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 256 256"><path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path></svg>
                    </button>

                    <span className="text-sm font-medium px-2">
                        Page {page} of {maxPage}
                    </span>

                    <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= maxPage}
                        className="p-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#000000" viewBox="0 0 256 256"><path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path></svg>
                    </button>
                </div>
            </div>
            {selectedImage && (
                <div onClick={() => setSelectedImage(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in duration-200">
                    <div onClick={(e) => e.stopPropagation()} className="relative max-w-5xl w-full max-h-screen flex flex-col items-center justify-center">
                        <button onClick={() => setSelectedImage(null)} className="absolute -top-12 cursor-pointer right-0 md:top-0 md:-right-12 text-white/70 hover:text-white transition bg-black/50 rounded-full p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256"><path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path></svg>
                        </button>

                        {isVideoFile(selectedImage.srcUrl, selectedImage.mediaType) ? (
                            <video
                                src={`${API_URL}${selectedImage.srcUrl}`}
                                controls
                                autoPlay
                                className="max-h-[80vh] w-auto rounded-md shadow-2xl"
                                onLoadStart={() => setIsImageLoaded(true)}
                            />
                        ) : (
                            <img
                                src={`${API_URL}${selectedImage.srcUrl}`}
                                alt="Full Preview"
                                onLoad={() => setIsImageLoaded(true)}
                                className={`max-h-[80vh] w-auto object-contain rounded-md shadow-2xl`}
                            />
                        )}

                        {isImageLoaded && selectedImage.caption && (
                            <div className="mt-4 text-center w-full px-4">
                                <p className="text-white text-sm md:text-base font-medium px-6 py-3 rounded-2xl inline-block max-h-[15vh] max-w-2xl overflow-y-auto">
                                    {selectedImage.caption}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}