let myRules = document.styleSheets[0].cssRules;
console.log(myRules);
// console.log(myRules.length);
// console.log(myRules[1]);

// Turn object into list
myRulesList = Object.keys(myRules).map((key) => [myRules[key]])
console.log(myRulesList)

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


// console.log(parseCSSText('.mybox {display: block;width: 20px;height: 20px;background - color: rgb(204, 204, 204); }'))

myRulesList.forEach((rule, i) => {
    let cssText = rule['0']['cssText']
    let CSSType = (rule['0'].constructor.name)
    if (CSSType == 'CSSKeyframesRule') {
        // Deletes the original animation
        document.styleSheets[0].deleteRule(i)
        // console.log(rule['0'])
        // console.log(i)
        let keyFrameName = (rule['0']['name'])
        keyFrameList = Object.keys(rule['0']).map((key) => [rule['0'][key]])
        // keyFrameList.forEach((frame, i) => {
        //     keyFrameObj = parseCSSText(frame['0']['cssText'])
        //     // Percentage
        //     console.log(keyFrameObj['ruleName'])
        //     for (var key in keyFrameObj['style']) {
        //         // property type
        //         console.log(key)
        //         // property value
        //         console.log(keyFrameObj['style'][key])
        //     }
        // })
        // Now go through all the CSS rules, to see where this animation is being used
        myRulesList.forEach((rule, j) => {
            let cssText = rule['0']['cssText']
            let CSSType = (rule['0'].constructor.name)
            if (CSSType == 'CSSStyleRule') {
                let CSSObj = parseCSSText(cssText)
                let animationName = CSSObj['style']['animationName']
                if (animationName == keyFrameName) {
                    // console.log('Match!')
                    // console.log(CSSObj['ruleName'])
                    let target = $(`${CSSObj['ruleName']}`)
                    target.each((i, element) => {
                        ['scroll', 'load'].forEach(evt =>
                            window.addEventListener(evt, () => {
                                let top = element.getBoundingClientRect().top
                                let bottom = element.getBoundingClientRect().top
                                // console.log('top', top)
                                // console.log(bottom)

                                // Save all the keyframes in an object
                                keyStyles = {}
                                // Loop through all the keyframes and add all styles to the keystyles object

                                keyFrameList.forEach((frame, i) => {
                                    keyFrameObj = parseCSSText(frame['0']['cssText'])
                                    // Percentage
                                    // console.log(keyFrameObj['ruleName'])
                                    if ((keyFrameObj['ruleName']).slice(-1) == '%') {
                                        str = keyFrameObj['ruleName']
                                        position = Number(str.substring(0, str.length - 1)) / 100
                                        // console.log(position)
                                    }
                                    // Below wasnt necessary, happens automatically
                                    // if (keyFrameObj['ruleName'] == 'from') {
                                    //     position = 0
                                    // }
                                    // if (keyFrameObj['ruleName'] == 'to') {
                                    //     position = 1;
                                    // }
                                    for (var key in keyFrameObj['style']) {
                                        // key = property type
                                        // property value
                                        // console.log(keyFrameObj['style'][key])
                                        let cssStyle = keyFrameObj['style'][key]
                                        if (key != "" && key != null && key != 'undefined') {
                                            // console.log(key)
                                            // console.log(cssStyle)
                                            if (keyStyles[`${key}`] == undefined) {
                                                keyStyles[`${key}`] = []
                                            }
                                            if (cssStyle != undefined) {
                                                rule = keyFrameObj['ruleName']
                                                keyStyles[`${key}`].push({ position, cssStyle, rule })
                                            }
                                            // console.log(keyStyles)
                                        }

                                    }
                                })



                                // Go through all styles one by one, e.g. backgroundcolor is calculated differently than width, height, etc.
                                for (key1 in keyStyles) {
                                    // console.log(key)
                                    // console.log(keyStyles[key])
                                    style = keyStyles[key1]


                                    // where is the object on our screen?
                                    // We want 0 to be bottom of the screen (start of animation) and 1 to be top of screen (end of animation)
                                    percentageScreen = (1 - (top / window.innerHeight))

                                    // console.log('pre', percentageScreen)
                                    positionList = []
                                    // Obtain all the keyframe positions, so that we can get the 2 keyframes closest to the postion on the screen
                                    for (key2 in style) {
                                        styleInstance = style[key2]

                                        // Value between 0 and 1
                                        position = styleInstance['position']
                                        style[key2]['distance'] = Math.abs(position - percentageScreen)
                                        positionList.push(position)
                                        // console.log(positionList)
                                    }


                                    // Now we want to sort these keyframe positions, so that we can get the 2 closest ones
                                    function sortDistance(a, b) {
                                        if (Math.abs(percentageScreen - a) < Math.abs(percentageScreen - b)) {
                                            return -1
                                        }
                                        else if (Math.abs(percentageScreen - a) == Math.abs(percentageScreen - b)) {
                                            return 0
                                        }
                                        else {
                                            return 1
                                        }

                                    }

                                    // Sorted from low to high distance
                                    sortedPositions = positionList.sort(sortDistance)
                                    absoluteSmallest = positionList[0]

                                    // console.log('list', positionList)
                                    absoluteLargest = positionList[positionList.length - 1]

                                    // get the first two, or just the first in case we have only one keyframe
                                    firstTwo = sortedPositions.slice(0, Math.min(2, sortedPositions.length))
                                    // filter out these two from the styles
                                    filteredStyles = style.filter((style) => firstTwo.includes(style.position))
                                    absoluteSmallestStyle = style.filter((style) => { return (style.position == absoluteSmallest) })[0]
                                    absoluteLargestStyle = style.filter((style) => { return (style.position == absoluteLargest) })[0]

                                    // console.log(absoluteLargestStyle)
                                    // console.log(filteredStyles)
                                    if (positionList.length >= 2) {
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
                                        console.log(element.innerHTML, percentageScreen)
                                        console.log(absoluteLargestStyle)
                                        if (percentageScreen < 0) {
                                            element.style[`${key1}`] = absoluteSmallestStyle['cssStyle']

                                        }
                                        else if (percentageScreen > 1) {

                                            element.style[`${key1}`] = absoluteLargestStyle['cssStyle']
                                        }

                                        else if (percentageScreen < 1 && percentageScreen > 0 && firstPercentage > 0 && secondPercentage > 0) {
                                            if (key1 == 'color' || key1 == 'background' || key1 == 'backgroundColor') {
                                                newStyle = `color-mix(in srgb, ${firstStyle} ${Math.round(firstPercentage)}%, ${secondStyle})`
                                            }
                                            if (key1 == 'transform') {
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
                                                            obj.unit = property.split('(')[1].replace(/[0-9]/g, "")
                                                            newArray.push(obj)
                                                        }
                                                    })
                                                    return (newArray)

                                                }
                                                firstArray = splitTransform(firstStyle)
                                                secondArray = splitTransform(secondStyle)

                                                newStyle = ''
                                                firstArray.forEach(transformation => {


                                                    // console.log(transformation.name)
                                                    // console.log('sa', secondArray[0].name)
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
                                                let unit1 = firstStyle.replace(/[0-9]/g, "")
                                                let unit2 = secondStyle.replace(/[0-9]/g, "")
                                                // console.log('test', value1, value2, unit1, unit2)

                                                if (unit1 == unit2) {
                                                    newStyle = `${value1 * (firstPercentage / 100) + value2 * (secondPercentage / 100)}${unit1}`
                                                    // console.log('nss', newStyle)
                                                }

                                                // newStyle = `calc(${firstStyle}*${firstPercentage}+${secondStyle}*${secondPercentage})`
                                            }
                                            element.style[`${key1}`] = newStyle
                                        }
                                        console.log(element.style['background'])

                                    }


                                    // console.log('yay')
                                    // element.style[`${ style } `] =
                                    // color-mix!! 
                                    // https://developer.mozilla.org/en-US/blog/color-palettes-css-color-mix/
                                    // 

                                    // console.log(top / window.innerHeight)
                                    // if (top < window.innerHeight) {
                                    //     element.style[`${ style } `] = cssStyle
                                    //     element.style.transitionDuration = '2s'
                                    // }
                                }

                            }))
                    })

                }
            }

        })
    }

}

)

// styleInstance = style[key]
// // console.log(styleInstance)

// // Value between 0 and 1
// position = styleInstance['position']
// // console.log('position', position)
// // the particular style, e.g. 'red'
// thisStyle = styleInstance['cssStyle']


// if (percentageScreen == position) {
//     computedStyle = thisStyle
//     // exactStyle = true
// }

// if (percentageScreen < position) {

// }
