gsap.registerPlugin(ScrollTrigger);
const timeLine = gsap.timeline();

const landingpageAnimation = () => {
  timeLine.from(
    "main",
    {
      y: 100,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power4.out",
    },
    "ani1",
  );

  timeLine.from(
    "nav",
    {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power4.out",
    },
    "ani1",
  );

  timeLine.from(
    ".hero h1, .hero p, .hero button",
    {
      opacity: 0,
      duration: 0.7,
      stagger: 0.2,
      y: 20,
      ease: "power3.out",
    },
    "ani2",
  );

  timeLine.from(
    "nav .left-nav, nav .mid-nav, nav .right-nav",
    {
      y: -30,
      duration: 0.7,
      opacity: 0,
    },
    "ani2",
  );

  timeLine.from(".tag", {
    height: 0,
    duration: 0.7,
    opacity: 0,
    ease: "power3.out",
  });
};

const scroll = () => {
  const paragraph = document.querySelector(".best-sellers > p");
  if (paragraph) {
    const words = paragraph.innerHTML.split(" ");
    paragraph.innerHTML = words
      .map(word => `<span class="word" style="display: inline-block; margin-right: 6px;">${word}</span>`)
      .join(" ");
  }

  gsap.from(".best-sellers > p .word", {
    opacity: 0,
    y: 100,
    duration: 0.6,
    stagger: 0.1,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".best-sellers > p",
      start: "top 80%",
      once: true,
    },
  });

  gsap.from(".best-sellers h1", {
    opacity: 0,
    y: -100,
    duration: 0.8,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".best-sellers h1",
      start: "top 90%",
      once: true,
    },
  });

  gsap.from(".product", {
    y: 100,
    opacity: 0,
    duration: 1.2,
    stagger: 0.2,
    ease: "power4.out",
    scrollTrigger: {
      trigger: ".product-container",
      start: "top 85%",
      once: true,
    },
  });
};

landingpageAnimation();

scroll();
