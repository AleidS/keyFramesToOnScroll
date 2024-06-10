// Obtain all style rules
let myRules = document.styleSheets[0].cssRules;
// Turn object into list
myRulesList = Object.keys(myRules).map((key) => [myRules[key]])

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
                let animationName = CSSObj1['style']['animationName']
                if (animationName != undefined && animationName == keyFrameName) {

                    let target = $(`${CSSObj1['ruleName']}`)
                    target.each((i, element1) => {
                        // console.log(element1.innerHTML, window.getComputedStyle(element1).background)

                        window.addEventListener('scroll', () => {
                            renderAnimations(element1, CSSObj1, keyFrameList1)
                        })
                        window.addEventListener('load', () => {
                            renderAnimations(element1, CSSObj1, keyFrameList1)
                        })
                    })
                }
            }
        })
    }

}

)

function renderAnimations(element, CSSObj, keyFrameList) {

    let top = element.getBoundingClientRect().top
    let bottom = element.getBoundingClientRect().top
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
        percentageScreen = (1 - (middle / window.innerHeight))

        let positionList = []
        // Obtain all the keyframe positions, so that we can get the 2 keyframes closest to the postion on the screen
        for (key2 in style) {
            styleInstance = style[key2]
            // Value between 0 and 1
            position = styleInstance['position']
            style[key2]['distance'] = Math.abs(position - percentageScreen)
            positionList.push(position)

        }


        // If we only have one property for the animation, take existing style as baseline or endpoint
        if (positionList.length < 2) {
            startingStyle = ''
            if (CSSObj['style'][`${key1}`] != undefined) {
                startingStyle = CSSObj['style'][`${key1}`]

            }
            else {

                startingStyle = style[key2]['cssStyle']
            }

            if (!positionList.includes(0)) {
                positionList.push(0)
                newStyle = {
                    position: 0,
                    distance: Math.abs(0 - percentageScreen),
                    cssStyle: startingStyle,
                    rule: '0%'
                }
                style.push(newStyle)
            }

            if (!positionList.includes(largestPosition)) {
                positionList.push(largestPosition)
                style.push({
                    position: largestPosition,
                    distance: Math.abs(largestPosition - percentageScreen),
                    cssStyle: startingStyle,
                    rule: `largestPositionManual`
                })
            }
        }
        positionList.sort()
        sortedPositions = [...positionList].sort((a, b) => {
            return (Math.abs(percentageScreen - a) - Math.abs(percentageScreen - b))
        })
        absoluteSmallest = positionList[0]

        absoluteLargest = positionList[positionList.length - 1]
        // get the first two, or just the first in case we have only one keyframe
        firstTwo = sortedPositions.slice(0, Math.min(2, sortedPositions.length))
        // filter out these two from the styles
        filteredStyles = style.filter((style) => firstTwo.includes(style.position))
        absoluteSmallestStyle = style.filter((style) => { return (style.position == absoluteSmallest) })[0]
        absoluteLargestStyle = style.filter((style) => { return (style.position == absoluteLargest) })[0]
        // console.log(absoluteLargestStyle)
        // console.log(filteredStyles)
        if (positionList.length >= 1) {

            var smallestDistance = filteredStyles[0].distance
            var smallestPosition = filteredStyles[0].position
            var firstStyle = filteredStyles[0].cssStyle

            var secondDistance = filteredStyles[1].distance
            var secondStyle = filteredStyles[1].cssStyle
            var secondPosition = filteredStyles[0].position
            var totalDistance = smallestDistance + secondDistance

            var firstPercentage = (totalDistance - smallestDistance) / totalDistance * 100
            var secondPercentage = (totalDistance - secondDistance) / totalDistance * 100

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
                                obj.value = property.split('(')[1].replace(/\D/g, "")
                                // get before opening bracket, remove numerical characters to get transformation unit
                                obj.unit = property.split('(')[1].replace(/[0-9.-]/g, "")
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
                            newStyle += `${transformation.name}(${transformation.value * firstPercentage / 100 + filteredSecond[0].value * secondPercentage / 100}${transformation.unit})`
                        }
                        else {
                            newStyle += `${transformation.name}(${transformation.value}${transformation.unit})`
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
        }
    }
}
