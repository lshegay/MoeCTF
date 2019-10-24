import React from 'react';

class Footer extends React.PureComponent<React.HTMLAttributes<HTMLElement>> {
  render(): JSX.Element {
    return (
      <footer className="blog-footer">
        <p>
          MoeCTF by
          <a href="https://github.com/Noramire/"> @noramire</a>
        </p>
        <p>
          <a href="#">Back to top</a>
        </p>
      </footer>
    );
  }
}

export default Footer;
