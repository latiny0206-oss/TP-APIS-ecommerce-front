/* Home view — composes the existing landing sections.
 * Hero variant comes from Tweaks (passed via prop). */

const Home = ({ heroVariant = 'midnight', showTestimonials = true }) => (
  <>
    <Hero variant={heroVariant} />
    <Categories />
    <Featured />
    {showTestimonials && <Testimonials />}
    <Newsletter />
  </>
);

window.Home = Home;
