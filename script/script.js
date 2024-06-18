
// Turn cssText (string) into object
https://stackoverflow.com/questions/8987550/convert-css-text-to-javascript-object
function parseCSSText(cssText) {
    var cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ");
    var style = {}, [, ruleName, rule] = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [, , cssTxt];
    var cssToJs = s => s.replace(/\W+\w/g, match => match.slice(-1).toUpperCase());
    var properties = rule.split(";").map(o => o.split(":").map(x => x && x.trim()));
    for (var [property, value] of properties) style[cssToJs(property)] = value;
    return { cssText, ruleName, style };
}

let generateAnimations = true;


window.addEventListener('load', function () {
    let isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

    if (!!isReduced) {
        alert('reduced motion detected, this website will not show animations')
    } else {
        iterateRules(generateAnimations)
    }


})

// Iterate through all stylesheets (or just the first one, if you prefer)
function iterateRules(generateAnimations) {
    // Obtains first stylesheet
    let myRules = document.styleSheets[0].cssRules;
    // Turn cssRules object into list
    let myRulesList = Object.keys(myRules).map((key) => [myRules[key]])

    /* If you only want to include the first stylesheet, comment out block below
    If you want to include all stylesheets, uncomment block below:
    Beware! also includes things like google fonts styles, bootstrap, etc!), 
    */

    myRulesList = []
    let styleSheets = document.styleSheets
    Object.keys(styleSheets).forEach(key => {
        try {
            let rules = (styleSheets[key].cssRules)
            if (rules != null) {
                Object.keys(rules).forEach(key => {
                    myRulesList.push([rules[key]])
                })
            }
        }
        catch {
            console.log(`couldnt obtain css rules from ${styleSheets[key].href}, they are not considered`)
        }
    })

    // Iteratre through each rule, and if this rule is an animation rule, find elements that use this animation
    myRulesList.forEach((rule, i) => {
        let CSSType = (rule['0'].constructor.name)
        if (CSSType == 'CSSKeyframesRule') {
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

                    // Get all animations names from animation property (could be multiple, so split this string on ',')
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

                    // Iterate through all animation names of a certain rule, and generate the scroll-based animations, as well as disable default animations
                    animationNames.forEach((animationName) => {
                        // If the animation rule name matches our keyframe animation name, convert this to a scroll animation
                        if (animationName != undefined && !animationName.includes('exclude') && !animationName.includes('Exclude') && animationName == keyFrameName) {

                            // Get all elements with this rule name (e.g. '.class' or '#id')
                            let target = $(`${CSSObj1['ruleName']}`)
                            //iterate through all these elements
                            target.each((i, element1) => {
                                // Remove any animation rules from elements, so that original keyframes are not being shown
                                elName = CSSObj1['ruleName']

                                function myListener(event) {
                                    renderAnimations(element1, CSSObj1, keyFrameList1, animationName)

                                }
                                if (generateAnimations == true) {
                                    // element1.style.setProperty('animation-duration', '0s', 'important');
                                    element1.style.setProperty('animation-iteration-count', '0', 'important');
                                    element1.style.setProperty('animation-fill-mode', 'none', 'important');
                                    element1.style.setProperty('animation-direction', 'normal', 'important');
                                    element1.style.setProperty('transition-duration', '0.5s', 'important');

                                    window.addEventListener('scroll', myListener)
                                    window.addEventListener('load', myListener)
                                    // Run all animations once on load
                                    renderAnimations(element1, CSSObj1, keyFrameList1, animationName)

                                }
                                else {
                                    // Return to original style (Does not consider inline styles)
                                    element1.style = CSSObj1['style']
                                    // element1.style.setProperty('animation-duration', '1.5s', 'important');
                                    // element1.style.setProperty('animation-Name', animationName, '!important')
                                    // element1.style.setProperty('animation-timing-function', 'ease-in-out', 'important');
                                    // element1.style.setProperty('animation-iteration-count', 'infinite', 'important');
                                    // element1.style.setProperty('animation-fill-mode', 'both', 'important');
                                    // element1.style.setProperty('animation-direction', 'alternate', 'important');
                                    // element1.style.setProperty('transition-duration', '0s', 'important');

                                    window.removeEventListener('scroll', myListener)
                                    window.removeEventListener('load', myListener)
                                }
                            })
                        }
                    })
                }
            })
        }

    })
}


function renderAnimations(element, CSSObj, keyFrameList, animationName) {
    if (generateAnimations == false) {
        // console.log(CSSObj['style'])
        // element.style = CSSObj['style']
    }
    if (generateAnimations == true) {

        // Script looks at position of top of element relative to viewport, 
        // can replace this by bottom or middle of element if you want
        let top = element.getBoundingClientRect().top
        let bottom = element.getBoundingClientRect().bottom
        let middle = top + bottom / 2

        // where is the object on our screen?
        // We want 0 to be bottom of the screen (start of animation) and 1 to be top of screen (end of animation)
        let percentageScreen = (1 - (top / window.innerHeight))


        // Object to save all the keyframe styles we want to look at (e.g. background-color, height, opacity, all become separate properties)
        keyStyles = {}

        // Loop through all the keyframes and add all styles to the keystyles object, with their positions
        keyFrameList.forEach((frame, i) => {
            keyFrameObj = parseCSSText(frame['0']['cssText'])
            // Obtain positions
            if ((keyFrameObj['ruleName']).slice(-1) == '%') {
                str = keyFrameObj['ruleName']
                position = Number(str.substring(0, str.length - 1)) / 100
            }

            // Obtain separate styles
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

        // Go through all styles one by one, e.g. backgroundcolor is calculated differently than width, height, etc.
        for (key1 in keyStyles) {

            // Style is an object with position, property type (e.g. 'background') and value (e.g. 'red')
            let style = keyStyles[key1]
            // Save all the positions in a list, so that we can see which is closest, smallest/largest etc
            let positionList = []
            // Obtain all the keyframe positions, so that we can get the 2 keyframes closest to the postion on the screen
            for (key2 in style) {
                styleInstance = style[key2]
                // Value between 0 and 1
                position = styleInstance['position']
                style[key2]['distance'] = Math.abs(position - percentageScreen)
                positionList.push(position)

            }

            // Sort positionlist
            positionList.sort((a, b) => {
                return (a - b)
            })

            absoluteSmallest = positionList[0]
            absoluteLargest = positionList[positionList.length - 1]

            // Sort positions by distance to current scroll position
            sortedPositions = [...positionList].sort((a, b) => {
                return (Math.abs(percentageScreen - a) - Math.abs(percentageScreen - b))
            })


            // Position of keyframe closest to our scroll position
            closesPosition = sortedPositions[0]

            // We want to mix this keyframe with the next one (so position is larger than the current one)
            // To make this script more precise, you should look at scrol direction and flip this if someone is scrolling up, 
            // then you want to mix with the next smallest frame
            largerOrEqual = [...sortedPositions].filter((position) => position >= closesPosition)
            firstTwo = largerOrEqual.slice(0, Math.min(2, largerOrEqual.length))
            // filter out these two positions from the styles
            filteredStyles = style.filter((style) => firstTwo.includes(style.position))

            filteredStylesSorted = [...filteredStyles].sort((a, b) => {
                return (a.distance - b.distance)
            })

            absoluteclosestStyle = style.filter((style) => { return (style.position == absoluteSmallest) })[0]
            absoluteLargestStyle = style.filter((style) => { return (style.position == absoluteLargest) })[0]


            // To interprolate the styles, we want to know which one is closest and which one is second closest
            var closestDistance = filteredStylesSorted[0].distance
            var closestPosition = filteredStylesSorted[0].position
            var closestStyle = filteredStylesSorted[0].cssStyle


            // If we still have more than 2 keyframes in the list, and we aren't before the first keyframe or beyond the last one, just take next keyframe in the list to mix
            if (filteredStylesSorted.length >= 2 && percentageScreen > closestPosition && percentageScreen < absoluteLargest) {
                var secondDistance = filteredStylesSorted[1].distance
                var secondStyle = filteredStylesSorted[1].cssStyle
            }
            // If we don't have 2 keyframes to mix, we simply adopt the first or last keyframe for start and end of animation
            else {
                var secondStyle = closestStyle
                if (percentageScreen < closestPosition) {
                    var secondDistance = Math.abs(percentageScreen - 0)
                }
                if (percentageScreen > absoluteLargest) {
                    var secondDistance = Math.abs(percentageScreen - 1)
                }
            }
            var totalDistance = closestDistance + secondDistance

            // To interprolate, we need to know how much of each style we need to mix (these two add up to 1 total)
            var closestPercentage = (totalDistance - closestDistance) / totalDistance * 100
            var secondPercentage = (totalDistance - secondDistance) / totalDistance * 100


            let newStyle = ''

            if (key1 == 'color' || key1 == 'background' || key1 == 'background-color' || key1 == 'border-color' || key1.includes('Color') || key1.includes('color')) {
                newStyle = `color-mix(in hsl, ${closestStyle} ${Math.round(closestPercentage)}%, ${secondStyle})`
            }

            else if (key1 == 'transform' || key1.includes('Transform') || key1.includes('transform') || key1 == 'filter' || key1 == 'backdropFilter') {
                // We want to split the string into all transformations that we perform
                function splitTransform(trStyle) {
                    array = trStyle.split(')')
                    newArray = []
                    array.forEach(property => {
                        if (property.length > 0) {
                            obj = {}
                            obj.name = property.split('(')[0]
                            // Get after opening bracket, remove non-numerical characters to get a tranformation value
                            obj.value = property.split('(')[1].replace(/[a-zA-Z%]/g, '')

                            // get before opening bracket, remove numerical characters to get transformation unit
                            obj.unit = property.split('(')[1].replace(/[^a-zA-Z%]/g, "")

                            newArray.push(obj)
                        }
                    })
                    return (newArray)
                }
                closestArray = splitTransform(closestStyle)
                secondArray = splitTransform(secondStyle)
                closestArray.forEach(transformation => {
                    let filteredSecond = secondArray.filter((el) => { return (el.name == transformation.name) })

                    if (filteredSecond.length > 0) {
                        newStyle += `${transformation.name}(${(transformation.value * closestPercentage) / 100 + filteredSecond[0].value * secondPercentage / 100}${transformation.unit})`
                    }

                    else {
                        newStyle += `${transformation.name}(${transformation.value}${transformation.unit})`
                    }

                })
            }

            else if (key1 == 'clipPath') {
                function splitClipPath(path1, path2) {
                    // Type of clip-path, e.g. circle, polygon, etc.
                    let name1 = path1.split('(')[0]
                    let name2 = path2.split('(')[0]
                    if (name1 != name2) {
                        console.log(`it appears you are trying to combine 2 
                        different types of clip-paths at ${animationName}), this won't work.`)
                        return
                    }

                    else {
                        newStyle += name1
                        newStyle += '('
                    }
                    if (name1 == 'path') {
                        console.log(`it appears you are using a custom clip-path ('path') at ${animationName}
                        this is not fully supported, but it might work if all paths have the exact same length and notation`)
                        newStyle += "\'"
                    }
                    let rest1 = path1.split('(')[1]
                    let rest2 = path2.split('(')[1]
                    let content1 = rest1.substring(0, rest1.length - 1)
                    let content2 = rest2.substring(0, rest2.length - 1)
                    let contentList1 = content1.split(' ')
                    let contentList2 = content2.split(' ')

                    contentList1.forEach((con, i) => {
                        // console.log(content)
                        let content = con
                        if (content.includes(',')) {
                            content = con.split(',')[0]
                        }
                        let content2 = contentList2[i]
                        if (contentList2[i].includes(',')) {
                            content2 = contentList2[i].split(',')[0]

                        }
                        let value1 = content.replace(/[a-zA-Z%]/g, '')
                        let unit1 = content.replace(/[^a-zA-Z%'`]/g, "")
                        let value2 = content2.replace(/[a-zA-Z%]/g, '')
                        let unit2 = content2.replace(/[^a-zA-Z%'`]/g, "")

                        if (unit1 != unit2 && value1 != 0 && value2 != 0) {
                            console.log(`it appears you are using two different units in your ${name1} clip-path at ${animationName} (${unit1} and ${unit2}), 
                        this cannot be interprolated`)
                            return
                        }

                        if (unit1 == NaN) {
                            unit1 = ''
                        }

                        else if (contentList1.length != contentList2.length) {
                            console.log(`clip paths at ${animationName} do not have the same length, please check`)
                        }
                        else {
                            let newValue = value1 * (closestPercentage / 100) + value2 * (secondPercentage / 100)
                            if (value1.length == 0 || value2.length == 0) {
                                newValue = ''
                            }
                            let newUnit = unit1

                            if (newValue.toString() != 'NaN') {
                                newStyle += newValue
                            }

                            newStyle += newUnit
                            newStyle += ' '
                        }
                        if (con.includes(',') || contentList2[i].includes(',')) {
                            newStyle += ','
                        }


                    })
                    if (name1 == 'path') {
                        newStyle += '\''
                    }
                    newStyle += ')'

                }
                closestArray = splitClipPath(closestStyle, secondStyle)

            }
            else if (key1 == 'boxShadow') {
                function splitShadow(style1, style2) {
                    // In case we have a color value like rgb, hsl, etc, we split the string after that color first (appears at start in js!)
                    let firstListSplit = style1.split(') ');
                    // We split the last part of the string at all spaces
                    let firstList = firstListSplit[firstListSplit.length - 1].split(' ')
                    // Same for the second list
                    let secondListSplit = style2.split(') ')
                    let secondList = secondListSplit[secondListSplit.length - 1].split(' ')

                    firstColor = firstList[0]
                    secondColor = secondList[0]
                    if (firstListSplit.length == 2) {
                        firstColor = firstListSplit[0]
                        firstColor += ')'
                    }
                    else {
                        firstList.shift()
                    }
                    if (secondListSplit.length == 2) {
                        secondColor = secondListSplit[0]
                        secondColor += ')'
                    }
                    else {
                        secondList.shift()
                    }


                    newStyle += `color-mix(in hsl, ${firstColor} ${Math.round(closestPercentage)}%, ${secondColor})`
                    newStyle += ' '

                    firstList.forEach((part, i) => {

                        let value1 = part.replace(/[a-zA-Z%]/g, '')
                        let unit1 = part.replace(/[^a-zA-Z%'`]/g, "")
                        let value2 = secondList[i].replace(/[a-zA-Z%]/g, '')
                        let unit2 = secondList[i].replace(/[^a-zA-Z%'`]/g, "")
                        let newValue = value1 * (closestPercentage / 100) + value2 * (secondPercentage / 100)
                        if (unit1 != unit2) {
                            console.log(`it appears you are using two different units for the box shadow at ${animationName},
                                this cannot be interprolated. Please check`)
                        }
                        else {
                            newStyle += newValue
                            newStyle += unit1
                            newStyle += ' '

                        }


                    })
                }
                closestArray = splitShadow(closestStyle, secondStyle)

            }
            // To make the script better, we could add support for shadows, clip-paths, etc similar to above. (they have a different syntax, so would need separate function)
            else if (key1 != 'boxShadow' && key1 != 'clipPath') {
                let value1 = closestStyle.replace(/\D/g, "")
                let value2 = secondStyle.replace(/\D/g, "")
                let unit1 = closestStyle.replace(/[0-9.-]/g, "")
                let unit2 = secondStyle.replace(/[0-9.-]/g, "")

                if (unit1 == unit2) {
                    newStyle = `${value1 * (closestPercentage / 100) + value2 * (secondPercentage / 100)}${unit1}`
                }
                else {
                    console.log(key1, 'at', animationName, 'uses', unit1, 'and', unit2, 'units, please use the same units for the same styles, for accurate interpolation')
                }

                // Border will still work if startign with a numerical value, but will not animate the color properly
                if (key1 == 'border') {
                    console.log('please beware that the border-property does not animate properly, if you split it up into color and width, it will work better!')
                }

                // if there is no numerical value, alert
                if (value1.length == 0 || value2.length == 0) {
                    console.log(key1, 'at', animationName, 'seems to use a non-numerical value,(`', unit1, '`) might not animate properly because it cannot be interprolated with this script')
                }
            }
            else {
                console.log(key1, 'is not yet supported by this script because it has a unique notation. You can add it manually to the script though, refer to line 239 and below')
            }

            // console.log(key1)
            try {
                element.style[`${key1}`] = newStyle
            }
            catch {
                console.log('oops, that did not work. Possibly, ', key1, ' is not yet supported by this script due to unique notation. Refer to line 239 and below to see if you can add it manually')
            }

        }
    }
}

function switchScript() {
    generateAnimations = !generateAnimations
    if (generateAnimations) {
        $('#switchLabel').html('Script is On (Scroll to view!)')
    }
    else {
        $('#switchLabel').html('Script is Off (showing keyframe animations)')
    }

    let isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`) === true || window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
    if (!!isReduced && !generateAnimations) {
        alert('reduced motion detected, keyframe animations will not show')
    }
    if (!!isReduced && generateAnimations) {
        alert('reduced motion detected, on-scroll animations will not show')
    }
    else {
        iterateRules(generateAnimations)
    }

}



