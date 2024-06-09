export const formatId = (id: number) => `#${id.toString().substring(2, 6)}`

export const firstLetterUpperCase = (string: string | null) => {
    if(string === null) return
    let result = ""

    for (let i = 0; i < string.length; i++) {
        let letter = string[i];
        if(i === 0){
         result += letter.toUpperCase()
        } else {
            result += letter
        }
    }
    return result
}