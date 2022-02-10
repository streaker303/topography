const common = {
    state: {
        isCollapse: false,
        stompClient: null,
        stompClientDirll: null,
        loginImg: '',
        logoImg: '',
        currentTheme: '', // white-theme
        currentTabName: '列表内容',
        chatIsShow: false,
        hasChatAuthority: false
    },
    mutations: {
        toggleCollapse: (state, visible) => {
            state.isCollapse = visible
        },
        switchTheme: (state, theme) => {
            state.currentTheme = theme
        },
        setStompClient: (state, stompClient) => {
            state.stompClient = stompClient
        },
        setStompClientDirll: (state, stompClient) => {
            state.stompClientDirll = stompClient
        },
        setloginImg: (state, loginImg) => {
            state.loginImg = loginImg
        },
        setlogoImg: (state, logoImg) => {
            state.logoImg = logoImg
        },
        setCurrentTabName: (state, name) => {
            state.currentTabName = name
        },
        setChatShow: (state, val) => {
            state.chatIsShow = val || !state.chatIsShow
        },
        setChatAuthority: (state, val) => {
            state.hasChatAuthority = val
        }
    },
    actions: {

    }
}

export default common
