import OBR from '@owlbear-rodeo/sdk'

export const themeManager = async () => {
    const setTheme = (theme) => {
        document.body.setAttribute('data-theme', theme.mode)
    }
    let theme = await OBR.theme.getTheme()
    setTheme(theme)
    OBR.theme.onChange((theme) => {
        setTheme(theme)
    })
}
