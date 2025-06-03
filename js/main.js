// js for navbar
$(".navbar .lines").click(function (e) {
  e.preventDefault();
  if ($("body").hasClass("navbar_active")) {
    $("body").removeClass("navbar_active");
    $("body").removeClass("disable_scroll");
  } else {
    $("body").addClass("navbar_active");
    $("body").addClass("disable_scroll");
  }
});

// $(".for_mobile ul li").click(function (e) {
//   $(".active").removeClass("active");
//   $(this).addClass("active");
// });

$(document).ready(function () {
  $(".logo").on("click", function (event) {
    window.location.href = "index.html";
  });
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
      });
    }
  });
});

$(".navbar .for_mobile ul .dropdown_li_sm > a").click(function (e) {
  if ($(window).width() < 900) {
    if (!$(this).parent().parent().parent().hasClass("ford")) {
      e.preventDefault();

      if ($(this).hasClass("dropdown_active")) {
        $(this).removeClass("dropdown_active");
        $(this).next("").css("max-height", "0px");
      } else {
        $(".dropdown_active").next().css("max-height", "0px");
        $(".dropdown_active").removeClass("dropdown_active");
        $(this).addClass("dropdown_active");
        var getheight = $(this).next().find(".boxes").height() + 50;
        var submenuheight = $(this).next().find(".extended-boxes").height() + 10;
        var totalheight = 0;
        if (isNaN(submenuheight)) {
          totalheight = getheight;
        } else {
          totalheight = getheight + submenuheight;
        }
        $(this)
          .next("")
          .css("max-height", totalheight + "px");
      }
    }
  }
});
$(".sub-menu a").click(function (e) {
  if ($(window).width() < 900) {
    if (!$(this).parent().parent().parent().hasClass("extended-ford")) {
      e.preventDefault();

      if ($(this).hasClass("extended-dropdown-active")) {
        $(this).removeClass("extended-dropdown-active");
        $(this).next("").css("max-height", "0px");
      } else {
        $(".extended-dropdown-active").next().css("max-height", "0px");
        $(".extended-dropdown-active").removeClass("extended-dropdown-active");
        $(this).addClass("extended-dropdown-active");
        var getheight = $(this).next().find(".extended-boxes").height() + 50;
        $(this)
          .next("")
          .css("max-height", getheight + "px");
      }
    }
  }
});
$(".uskoro").click(function (e) {
  e.preventDefault();
});
$(".uskoro-procitaj-vise").click(function (e) {
  e.preventDefault();
});

$(".root").scroll(function () {
  if ($(this).scrollTop() > 100) {
    $("body").addClass("navbar_scrolled");
  } else {
    $("body").removeClass("navbar_scrolled");
  }
});
// js for navbar end

// js for header
$(".hero-slider").slick({
  // cssEase: "cubic-bezier(0.600, -0.400, 0.735, 0.045)",
  dots: true,
  arrows: false,
  infinite: true,
  speed: 2500,
  slidesToShow: 1,
  adaptiveHeight: true,
  autoplay: true,
  autoplaySpeed: 3000,
});

// js for about us
$(".about-us-slider").slick({
  cssEase: "cubic-bezier(0.600, -0.400, 0.735, 0.045)",
  dots: false,
  arrows: false,
  // prevArrow: $(".custom-prev"),
  // nextArrow: $(".custom-next"),
  infinite: true,
  speed: 2500,
  slidesToShow: 3,
  adaptiveHeight: true,
  autoplay: true,
  autoplaySpeed: 2500,
  responsive: [
    {
      breakpoint: 770,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 490,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
});

$(document).ready(function () {
  if ($(".main-page").length > 0) {
    // var top0 = $("#hero").offset().top - 700;
    var top1 = $("#usluge").offset().top - 700;
    var top2 = $("#become-agent").offset().top - 700;
    var top3 = $("#about-us").offset().top - 700;

    $(".root").scroll(function () {
      var scrollPos = $(".root").scrollTop();
      // if (scrollPos >= top0 && scrollPos < top1) {
      //   $(".active").removeClass("active");
      //   $("#hero-in-view").addClass("active");
      // } else
      if (scrollPos >= top1 && scrollPos < top2) {
        $(".active").removeClass("active");
        $("#usluge-in-view").addClass("active");
      } else if (scrollPos >= top2 && scrollPos < top3) {
        $(".active").removeClass("active");
        $("#become-agent-in-view").addClass("active");
      } else if (scrollPos >= top3) {
        $(".active").removeClass("active");
        $("#about-us-in-view").addClass("active");
      }
    });
  }
});
$(document).ready(function () {
  // form submited
  $(".form-submit").click(function (e) {
    e.preventDefault();

    if ($(".quote-form-inputs")[0].checkValidity()) {
      var contact_form = {
        name: $(".agent-name").val(),
        city: $(".agent-city").val(),
        adress: $(".agent-adress").val(),
        zip: $(".agent-zip").val(),
        phone: $(".agent-phone").val(),
        email: $(".agent-email").val(),
        pib: $(".agent-pib").val(),
        message: $(".agent-message").val(),
      };

      $.ajax({
        type: "POST",
        url: "php/agent-form.php", // Ensure the URL is correct relative to index.html
        data: contact_form,
        dataType: "json",
        success: function (response) {
          console.log("AJAX Response:", response); // Log success response

          if (response.status === "success") {
            alert("Form submitted successfully!");
          } else {
            alert("Error: " + response.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("AJAX Error:", textStatus, errorThrown); // Log any AJAX errors
          console.log("Response Text:", jqXHR.responseText); // Log the response text
          alert("An error occurred while submitting the form. Please try again.");
        },
      });

      // Clear form inputs
      $(".quote-form-inputs input").val("");
      $(".quote-form-inputs textarea").val("");
    } else {
      $(".quote-form-inputs input").each(function () {
        if (!$(this)[0].validity.valid) {
          $(this).css("border", "1px solid red");
        } else {
          $(this).css("border", "1px solid #404040");
        }
      });
      if (!$(".quote-form-inputs textarea")[0].validity.valid) {
        $(".quote-form-inputs textarea").css("border", "1px solid red");
      } else {
        $(".quote-form-inputs textarea").css("border", "1px solid #404040");
      }
    }
  });

  $(".form-submit-contact").click(function (e) {
    e.preventDefault();

    // const captchaResponse = grecaptcha.getResponse();

    if ($(".quote-form-inputs-contact")[0].checkValidity()) {
      var contact_form = {
        name: $(".contact-name").val(),
        email: $(".contact-email").val(),
        subject: $(".contact-subject").val(),
        message: $(".contact-message-box").val(),
      };
      console.log(contact_form);

      // if (captchaResponse.length > 0) {
      $.ajax({
        type: "POST",
        url: "php/contact-us.php", // Ensure the URL is correct relative to index.html
        data: contact_form,
        dataType: "json",
        success: function (response) {
          console.log("AJAX Response:", response); // Log success response

          if (response.status === "success") {
            alert("Form submitted successfully!");
          } else {
            alert("Error: " + response.message);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("AJAX Error:", textStatus, errorThrown); // Log any AJAX errors
          console.log("Response Text:", jqXHR.responseText); // Log the response text
          alert("An error occurred while submitting the form. Please try again.");
        },
      });
      // Clear form inputs
      $(".quote-form-inputs-contact input").val("");
      $(".quote-form-inputs-contact textarea").val("");

      // location.reload();
      // } else {
      //   $(".recap-div").addClass("recap-div_active");
      // }
    } else {
      $(".quote-form-inputs-contact input").each(function (index) {
        if (!$(this)[0].validity.valid) {
          $(this).css("border", "1px solid red");
        } else {
          $(this).css("border", "1px solid #404040");
        }
      });
      if (!$(".quote-form-inputs-contact textarea")[0].validity.valid) {
        $(".quote-form-inputs textarea").css("border", "1px solid red");
      } else {
        $(this).css("border", "1px solid #404040");
      }
    }
  });
});
