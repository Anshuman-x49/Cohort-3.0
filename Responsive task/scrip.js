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

landingpageAnimation();
