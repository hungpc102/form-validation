// Đối tượng 'Validator'
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }

            element = element.parentElement
        }
    }

    var selectorRules = {}

    function validate(inputElement, rule) {
        // Var errorElement = getParent(inputElement, '.form-group')
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage = rule.test(inputElement.value);

        // lấy ra các rules của selector
        var rules = selectorRules[rule.selector]

        // Lặp qua từng rule và kiểm tra
        // Nếu có lỗi thì dừng kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case "checkbox":
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break

                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            errorElement.innerText = ''
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

        }

        return !errorMessage
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form)

    if (formElement) {
        // Khi submit form 
        formElement.onsubmit = function (e) {
            e.preventDefault()

            var isFormValid = true

            // Lặp qua từng rules và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = validate(inputElement, rule)
                if (!isValid) {
                    isFormValid = false
                }
            })




            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {

                    var enableInputs = formElement.querySelectorAll('[name]')
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value
                                }
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = ''
                                    return values
                                }
                                if (!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }

                                values[input.name].push(input.value)
                                break

                            case 'file':
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {});

                    options.onSubmit(formValues)
                }
                // Trường hợp submit với hành vi mặc định 
                else {
                    formElement.submit()
                }
            }
        }

        // Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input...)
        options.rules.forEach(function (rule) {

            // lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }


            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function (inputElements) {
                // Xử lý trường hợp blur khỏi input
                inputElements.onblur = function () {
                    validate(inputElements, rule)
                }

                // xử lý mỗi khi người dùng nhập
                inputElements.oninput = function () {
                    var errorElement = getParent(inputElements, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ''
                    getParent(inputElements, options.formGroupSelector).classList.remove('invalid')
                }
            })
        })

    }
}

// Định nghĩa rules
// Nguyên tắc của các rulers
// 1.Khi có lỗi  => trả ra message lỗi
// 2. Khi hợp lệ => không trả ra gì cả (undefined)
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            if (typeof value !== 'string') {
                // Xử lý cho các input như checkbox và radio
                return value ? undefined : message || 'Vui lòng nhập trường này';
            } else {
                // Xử lý cho các input như text hoặc password
                const trimmedValue = value.trim();
                return trimmedValue ? undefined : message || 'Vui lòng nhập trường này';
            }


        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự `
        }
    }
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập không chính xác'
        }
    }
}

//  Mong muốn của chúng ta
Validator({
    form: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
        // Validator.isRequired('#fullname', 'Vui lòng nhập tên đầy đủ của bạn'),
        // Validator.isRequired("#email"),
        // Validator.isEmail('#email'),
        Validator.isRequired('#avatar', 'Vui lòng thêm ảnh'),
        // Validator.minLength('#password', 6),
        // Validator.isRequired('#password_confirmation'),
        // Validator.isRequired('#province '),
        // Validator.isRequired('input[name="gender"]'),
        // Validator.isConfirmed('#password_confirmation', function () {
        //     return document.querySelector('#form-1 #password').value
        // }, 'Mật khẩu nhập lại không chính xác')
    ],
    onSubmit: function (data) {
        // Call API
        console.log(data)
    }
})
