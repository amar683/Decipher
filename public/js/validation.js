$(function(){
    let reigistrationForm = $("#user_registraion_form");

    if(reigistrationForm.length){

        reigistrationForm.validate({
            rules:{
                name:{
                    required:true
                },
                sign_in_email:{
                    required: true,
                    email: true
                },
                sign_in_password: {
                    required:true,
                    minlength: 6
                },
                sign_in_confirm_password:{
                    required:true,
                    equalTo: "#sign-in-password"
                }
            },
            messages:{
                name:{
                    required: 'Name is required'
                },
                sign_in_email:{
                    required: 'Email is required',
                    email: "Please enter a valid email"
                },
                sign_in_password:{
                    required: "Password is required",
                    minlength: "Password should have min 6 characters"
                },
                sign_in_confirm_password:{
                    required:"Confirm password is required",
                    equalTo: "Password do not match"
                }

            },
            submitHandler: function(form) {
                form.submit();
              }
        })
    }

    let signInForm = $("#sign_in_form");

    if(signInForm.length){
        signInForm.validate({
            rules:{
                sign_in_email:{
                    required: true,
                    email: true
                },
                sign_in_password: {
                    required:true,
                    minlength: 6
                }
            },
            messages:{
                sign_in_email:{
                    required: 'Email is required',
                    email: "Please enter a valid email"
                },
                sign_in_password:{
                    required: "Password is required",
                    minlength: "Password should have min 6 characters"
                }

            },
            submitHandler: function(form) {
                form.submit();
            }
        })
    }

    let organisationRegistration = $("#organisation_registration_form");

    if(organisationRegistration.length){
        organisationRegistration.validate({
            rules:{
                org_name:{
                    required:true
                },
                org_email:{
                    required: true,
                    email: true
                },
                org_contact: {
                    required:true,
                    minlength: 10,
                    maxlength:10
                },
                org_cause:{
                    required:true,
                }
            },
            messages:{
                org_name:{
                    required: 'Name is required'
                },
                org_email:{
                    required: 'Email is required',
                    email: "Please enter a valid email"
                },
                org_contact:{
                    required: "Contact Number is required",
                    minlength: "Enter a valid Contact Number",
                    maxlength: "Enter a valid Contact Number"
                },
                org_cause:{
                    required:"This field is required"
                }

            },
            submitHandler: function(form) {
                form.submit();
            }
        })
    }

    let contactUsForm = $("#contact-us-form");

    if(contactUsForm.length){
        contactUsForm.validate({
            rules:{
                name:{
                    required: true,
                },
                email:{
                    required: true,
                    email: true
                },
                query: {
                    required:true,
                }
            },
            messages:{
                name:{
                    required: "Name is required"
                },
                email:{
                    required: 'Email is required',
                    email: "Please enter a valid email"
                },
                query:{
                    required: "This field is required"
                }
            },
            submitHandler: function(form) {
                form.submit();
            }
        })
    }

    let writeArticleForm  = $("#write-article-form");

    if(writeArticleForm.length){
        writeArticleForm.validate({
            rules:{
                title:{
                    required: true,
                },
                author:{
                    required: true,
                },
                category: {
                    required:true,
                },
                content: {
                    required:true,
                }
            },
            messages:{
                title:{
                    required: "Title is required",
                },
                author:{
                    required: "Author is required",
                },
                category: {
                    required: "Please select a category",
                },
                content: {
                    required: "Please write some content to publish",
                }
            },
            submitHandler: function(form) {
                form.submit();
            }
        })
    }
})