// 
function Validator(options) {
    let selectorRules = {}

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    // function to validate input 
    function validate(inputElement, rule) {
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        let errorMsg

        // Get rules of selector
        let rules = selectorRules[rule.selector]

        for (let i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMsg = rules[i](formElement.querySelector(rule.selector + ':checked'))
                    break;
                default:
                    errorMsg = rules[i](inputElement.value)
            }
            if (errorMsg) break
        }
        if (errorMsg) {
            errorElement.innerText = errorMsg
            getParent(inputElement, options.formGroupSelector).classList.add(options.invalidClassName)
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove(options.invalidClassName)

        }
        return !errorMsg
    }
    // get element
    let formElement = document.querySelector(options.form)
    if (formElement) {

        // When submit form 
        formElement.onsubmit = function(e) {
            e.preventDefault()

            let isFormValid = true

            // 
            options.rules.forEach(function(rule) {
                let inputElement = formElement.querySelector(rule.selector)

                let isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })


            if (isFormValid) {
                // In case you want to submit with this Validate Library
                if (typeof options.onSubmit === 'function') {
                    let enableInputs = formElement.querySelectorAll('[name]')
                    let formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch (input.type) {
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = []
                                    return values
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value
                                break;
                            case 'file':
                                values[input.name] = input.files
                                break;
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})
                    options.onSubmit(formValues)
                }
                // In case you want to submit with other ways
                else {
                    formElement.submit()
                }
            }
        }

        // Loop for each rule and validate
        options.rules.forEach(function(rule) {

                // Save all rules for each input element
                if (Array.isArray(selectorRules[rule.selector])) {
                    selectorRules[rule.selector].push(rule.test)
                } else {
                    selectorRules[rule.selector] = [rule.test]
                }
                let inputElements = formElement.querySelectorAll(rule.selector)

                Array.from(inputElements).forEach(function(inputElement) {
                    if (inputElement) {
                        // When user blur outside the input element
                        inputElement.onblur = function() {
                            validate(inputElement, rule)
                        }

                        // When user type in input field
                        inputElement.oninput = function() {
                            let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                            errorElement.innerText = ''
                            getParent(inputElement, options.formGroupSelector).classList.remove(options.invalidClassName)
                        }
                    }
                })


            })
            // console.log(selectorRules)
    }
}



// Rules
Validator.isRequired = function(selector, message) {
    return {
        selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}
Validator.isEmail = function(selector, message) {
    return {
        selector,
        test: function(value) {
            let regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
            return regex.test(value) ? undefined : message || 'Email không hợp lệ. Vui lòng nhập lại'
        }
    }
}
Validator.minLength = function(selector, min, message) {
    return {
        selector,
        test: function(value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
}
Validator.isComfirmed = function(selector, getConfirmValue, message) {
    return {
        selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || `Giá trị nhập vào không chính xác`
        }
    }
}