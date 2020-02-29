import React, { FunctionComponent, HTMLAttributes } from 'react';

const Footer: FunctionComponent<HTMLAttributes<HTMLElement>> = ({ className, ...rest }) => (
  <footer
    className={`blog-footer ${className ?? ''}`}
    {...rest}
  >
    <p>
      MoeCTF by
      <a href="https://github.com/Noramire/"> @noramire</a>
    </p>
    <p>
      <a href="#">Back to top</a>
    </p>
  </footer>
);

export default Footer;
