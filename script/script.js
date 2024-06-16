
// Turn cssText (string) into object
https://stackoverflow.com/questions/8987550/convert-css-text-to-javascript-object
function parseCSSText(cssText) {
    var cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ");
    var style = {}, [, ruleName, rule] = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [, , cssTxt];
    var cssToJs = s => s.replace(/\W+\w/g, match => match.slice(-1).toUpperCase());
    var properties = rule.split(";").map(o => o.split(":").map(x => x && x.trim()));
    for (var [property, value] of properties) style[cssToJs(property)] = value;
    return { cssText, ruleName, style };
} /* updated 2017-09-28 */



window.addEventListener('load', function () {
    let generateAnimations = true;
    iterateRules()
})

function iterateRules() {
    let myRules = document.styleSheets[0].cssRules;


    /* If you want to include all stylesheets, uncomment below:
    Beware! also includes things like google fonts styles, bootstrap, etc!), 
    */
    // myRules = []
    // nrOfSheets = null
    // let styleSheets = document.styleSheets
    // console.log(document.styleSheets)
    // Object.keys(styleSheets).forEach(key => {
    //     try {

    //         let rules = (styleSheets[key].cssRules)
    //         if (rules != null) {
    //             myRules[key] = rules
    //         }
    //         console.log('yay')
    //     }
    //     catch {
    //         console.log(`couldnt obtain css rules from ${styleSheets[key].href}, they are not considered`)
    //     }
    // })
    // console.log(myRules)

    // Turn object into list
    myRulesList = Object.keys(myRules).map((key) => [myRules[key]])

    myRulesList.forEach((rule, i) => {
        let cssText = rule['0']['cssText']
        let CSSType = (rule['0'].constructor.name)
        if (CSSType == 'CSSKeyframesRule') {
            // Deletes the original animation
            // document.styleSheets[0].deleteRule(0)
            // Name of current animation

            let keyFrameName = (rule['0']['name'])
            let keyFrameList1 = Object.keys(rule['0']).map((key) => [rule['0'][key]])

            // Now go through all the CSS rules again, to see where this animation is being used
            myRulesList.forEach((rule, j) => {

                let cssText = rule['0']['cssText']
                let CSSType = (rule['0'].constructor.name)
                if (CSSType == 'CSSStyleRule') {
                    let CSSObj1 = parseCSSText(cssText)
                    let animationNames = []

                    // Get animations names from animation property
                    if (CSSObj1['style']['animation'] != null) {
                        // console.log('hey')
                        animations = CSSObj1['style']['animation']
                        animationList = animations.split(',')
                        animationList.forEach((element) => {
                            elementList = element.split(' ')
                            animationNames.push(elementList[elementList.length - 1])
                        }
                        )

                    }
                    // Add any separate animation names from animationName property to the list
                    animationNames.push(CSSObj1['style']['animationName'])

                    // Iterate through all animation names of a certain rule
                    animationNames.forEach((animationName) => {
                        // If the animation rule name matches our keyframe animation name, convert this to a scroll animation
                        if (animationName != undefined && !animationName.includes('exclude') && !animationName.includes('Exclude') && animationName == keyFrameName) {

                            let target = $(`${CSSObj1['ruleName']}`)
                            target.each((i, element1) => {
                                // Remove any animation rules from elements, so that original keyframes are not being shown
                                elName = CSSObj1['ruleName']
                                if (generateAnimations == true) {
                                    document.styleSheets[0].insertRule(
                                        `${elName} { animation-duration:0s!important;\
                                        animation-iteration-count: 1!important;\
                                        animation-fill-mode:none!important;\
                                        animation-direction:normal!important;\
                                        transition-duration:0.5s!important;\
                                    }`, document.styleSheets[0].cssRules.length
                                    )
                                    window.addEventListener('scroll', () => {
                                        renderAnimations(element1, CSSObj1, keyFrameList1)
                                    })
                                    window.addEventListener('load', () => {
                                        renderAnimations(element1, CSSObj1, keyFrameList1)
                                    })
                                }
                                else {
                                    document.styleSheets[0].insertRule(
                                        `${elName} { animation-duration:4s!important;\
                                        animation-iteration-count: infinite!important;\
                                        animation-fill-mode:forwards!important;\
                                        animation-direction:alternate!important;\
                                        transition-duration:0.5s!important;\
                                    }`, document.styleSheets[0].cssRules.length
                                    )
                                }
                            })
                        }
                    })
                }
            })
        }

    })
}

function renderAnimations(element, CSSObj, keyFrameList) {

    let top = element.getBoundingClientRect().top
    let bottom = element.getBoundingClientRect().bottom
    let middle = top + bottom / 2
    // Save all the keyframes in an object
    keyStyles = {}
    // Loop through all the keyframes and add all styles to the keystyles object
    allPositions = []
    keyFrameList.forEach((frame, i) => {
        keyFrameObj = parseCSSText(frame['0']['cssText'])
        if ((keyFrameObj['ruleName']).slice(-1) == '%') {
            str = keyFrameObj['ruleName']
            position = Number(str.substring(0, str.length - 1)) / 100
            allPositions.push(position)
        }

        for (var key in keyFrameObj['style']) {
            let cssStyle = keyFrameObj['style'][key]
            if (key != "" && key != null && key != 'undefined') {
                if (keyStyles[`${key}`] == undefined) {
                    keyStyles[`${key}`] = []
                }
                if (cssStyle != undefined) {
                    rule = keyFrameObj['ruleName']
                    keyStyles[`${key}`].push({ position, cssStyle, rule })
                }
            }

        }
    })
    let largestPosition = Math.max(...allPositions)


    // Go through all styles one by one, e.g. backgroundcolor is calculated differently than width, height, etc.
    for (key1 in keyStyles) {

        let style = keyStyles[key1]
        // where is the object on our screen?
        // We want 0 to be bottom of the screen (start of animation) and 1 to be top of screen (end of animation)
        percentageScreen = (1 - (top / window.innerHeight))

        let positionList = []
        // Obtain all the keyframe positions, so that we can get the 2 keyframes closest to the postion on the screen
        for (key2 in style) {
            styleInstance = style[key2]
            // Value between 0 and 1
            position = styleInstance['position']
            style[key2]['distance'] = Math.abs(position - percentageScreen)
            positionList.push(position)

        }

        positionList.sort((a, b) => {
            return (a - b)
        })

        absoluteSmallest = positionList[0]
        absoluteLargest = positionList[positionList.length - 1]

        // Sort positions by distance to screen
        sortedPositions = [...positionList].sort((a, b) => {
            return (Math.abs(percentageScreen - a) - Math.abs(percentageScreen - b))
        })
        // get the first two, or just the first in case we have only one keyframe

        firstPosition = sortedPositions[0]

        largerOrEqual = [...sortedPositions].filter((position) => position >= firstPosition)


        firstTwo = largerOrEqual.slice(0, Math.min(2, largerOrEqual.length))
        // filter out these two from the styles
        filteredStyles = style.filter((style) => firstTwo.includes(style.position))

        filteredStylesSorted = [...filteredStyles].sort((a, b) => {
            return (a.distance - b.distance)
        })
        // if (element.className.includes('highCard1')) {
        //     // console.log(secondArray, transformation.name, filteredSecond)
        //     console.log(sortedPositions, filteredStyles, filteredStylesSorted)
        // }
        absoluteSmallestStyle = style.filter((style) => { return (style.position == absoluteSmallest) })[0]
        absoluteLargestStyle = style.filter((style) => { return (style.position == absoluteLargest) })[0]


        var smallestDistance = filteredStylesSorted[0].distance
        var smallestPosition = filteredStylesSorted[0].position
        var firstStyle = filteredStylesSorted[0].cssStyle


        if (filteredStylesSorted.length >= 2 && percentageScreen > smallestPosition && percentageScreen < largestPosition) {
            var secondDistance = filteredStylesSorted[1].distance
            var secondStyle = filteredStylesSorted[1].cssStyle
            var secondPosition = filteredStylesSorted[1].position
        }
        else {

            if (percentageScreen < smallestPosition) {
                var secondDistance = Math.abs(percentageScreen - 0)
                var secondStyle = firstStyle
                var secondPosition = 0
            }
            if (percentageScreen > largestPosition) {
                var secondDistance = Math.abs(percentageScreen - 1)
                var secondStyle = firstStyle
                var secondPosition = 1
            }
        }
        var totalDistance = smallestDistance + secondDistance

        var firstPercentage = (totalDistance - smallestDistance) / totalDistance * 100
        var secondPercentage = (totalDistance - secondDistance) / totalDistance * 100

        // if (element.className.includes('highCard1')) {
        //     // console.log(secondArray, transformation.name, filteredSecond)
        //     console.log(percentageScreen, smallestPosition, secondPosition)
        //     console.log(firstPercentage, secondPercentage)
        //     console.log(firstStyle, secondStyle)
        // }

        // console.log(smallestDistance, absoluteSmallest, firstStyle, secondDistance, secondStyle)
        let newStyle = ''
        if (percentageScreen <= absoluteSmallest) {
            newStyle = absoluteSmallestStyle['cssStyle']

        }
        else if (percentageScreen >= absoluteLargest) {

            newStyle = absoluteLargestStyle['cssStyle']
        }
        else if (percentageScreen > absoluteSmallest && percentageScreen < absoluteLargest) {
            if (key1 == 'color' || key1 == 'background' || key1 == 'background-color' || key1 == 'border-color') {
                newStyle = `color-mix(in hsl, ${firstStyle} ${Math.round(firstPercentage)}%, ${secondStyle})`
            }
            else if (key1 == 'transform' || key1 == 'filter' || key1 == 'backdrop-filter') {
                // We want to split the string into all transformations that we perfomr
                function splitTransform(trStyle) {
                    array = trStyle.split(')')
                    newArray = []
                    array.forEach(property => {
                        if (property.length > 0) {
                            obj = {}
                            obj.name = property.split('(')[0]
                            // Get after opening bracket, remove non-numerical characters to get a tranformation value
                            obj.value = property.split('(')[1].replace(/[a-zA-Z]/g, '')

                            // get before opening bracket, remove numerical characters to get transformation unit
                            obj.unit = property.split('(')[1].replace(/[^a-zA-Z]/g, "")
                            // if (element.className.includes('highCard1')) {
                            //     console.log(obj.value, obj.unit)
                            // }
                            newArray.push(obj)
                        }
                    })
                    return (newArray)
                }
                firstArray = splitTransform(firstStyle)
                secondArray = splitTransform(secondStyle)
                firstArray.forEach(transformation => {
                    let filteredSecond = secondArray.filter((el) => { return (el.name == transformation.name) })

                    if (filteredSecond.length > 0) {
                        newStyle += `${transformation.name}(${(transformation.value * firstPercentage) / 100 + filteredSecond[0].value * secondPercentage / 100}${transformation.unit})`
                    }
                    // console.log(element.className)

                    else {
                        newStyle += `${transformation.name}(${transformation.value}${transformation.unit})`
                    }

                    if (element.className.includes('right')) {
                        console.log(transformation.value, transformation.name, percentageScreen)
                        console.log(firstPercentage, secondPercentage)
                    }


                })
            }
            else {
                let value1 = firstStyle.replace(/\D/g, "")
                let value2 = secondStyle.replace(/\D/g, "")
                let unit1 = firstStyle.replace(/[0-9.-]/g, "")
                let unit2 = secondStyle.replace(/[0-9.-]/g, "")

                if (unit1 == unit2) {
                    newStyle = `${value1 * (firstPercentage / 100) + value2 * (secondPercentage / 100)}${unit1}`
                }
                else {
                    // alert(unit1, unit2, 'please use the same units for the same styles')
                }
            }
        }
        // console.log(key1)
        element.style[`${key1}`] = newStyle
        if (element == document.getElementsByClassName('triangle')[0]) {
            // console.log(percentageScreen, position, newStyle, firstPercentage, secondPercentage)
        }

    }
}

