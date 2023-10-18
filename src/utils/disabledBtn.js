export const disabledBtn = (btnDisabled,isDisabled,isDelay = false,time = 1000) => {
    if(isDisabled){
        btnDisabled.value = isDisabled
    }else {
        if(isDelay){
            setTimeout(() => {
                btnDisabled.value = isDisabled
            },time * 1000)
        }else {
            btnDisabled.value = isDisabled
        }
    }
}