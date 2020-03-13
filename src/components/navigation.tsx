import React, { HTMLAttributes, FunctionComponent, useState } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Container,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import { IoIosCash } from 'react-icons/io';

import { User } from '../../app/models/units';
import config from '../../app/settings/config';

interface NavigationProps extends HTMLAttributes<HTMLElement> {
  currentNav?: string;
  user?: User;
}

const Navigation: FunctionComponent<NavigationProps> = ({
  currentNav,
  className,
  user,
  ...rest
}) => {
  const [menuVisibility, setMenuVisibility] = useState(false);

  const imageStyle = {
    display: 'block',
    background: `url(/${user && user.avatar ? user.avatar : 'avatar.jpg'}) no-repeat center`,
    backgroundSize: 'cover',
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 90,
  };

  let loggedInNav = (
    <>
      <NavItem>
        {currentNav == 'login' ? (
          <NavLink href="/login" active>Login</NavLink>
        ) : (
          <NavLink href="/login">Login</NavLink>
        )}
      </NavItem>
      <NavItem>
        {currentNav == 'register' ? (
          <NavLink href="/register" active>Register</NavLink>
        ) : (
          <NavLink href="/register">Register</NavLink>
        )}
      </NavItem>
    </>
  );
  if (user) {
    loggedInNav = (
      <>
        <NavItem>
          <NavLink>{`${user.points} Points`}</NavLink>
        </NavItem>
        <NavItem>
          <NavLink>
            {/* {`${(user as CoinsUser).wallet} `} */}
            <IoIosCash style={{ width: '1.3em', height: '1.3em', marginBottom: '2px' }} />
          </NavLink>
        </NavItem>
        <UncontrolledDropdown nav inNavbar>
          <DropdownToggle nav caret style={imageStyle} className="caret-off" />
          <DropdownMenu right>
            <DropdownItem href="/profile">
              Profile
            </DropdownItem>
            <DropdownItem href="/logout">
              Logout
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </>
    );
  }

  return (
    <Navbar
      color="dark"
      dark
      expand="md"
      className={className}
      {...rest}
    >
      <Container>
        <NavbarBrand href="/">{config.siteTitle}</NavbarBrand>
        <NavbarToggler onClick={(): void => setMenuVisibility(!menuVisibility)} />
        <Collapse isOpen={menuVisibility} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem>
              {currentNav == 'tasks' ? (
                <NavLink href="/tasks" active>Tasks</NavLink>
              ) : (
                <NavLink href="/tasks">Tasks</NavLink>
              )}
            </NavItem>
            <NavItem>
              {currentNav == 'rules' ? (
                <NavLink href="/rules" active>Rules</NavLink>
              ) : (
                <NavLink href="/rules">Rules</NavLink>
              )}
            </NavItem>
            <NavItem>
              {currentNav == 'scoreboard' ? (
                <NavLink href="/scoreboard" active>Scoreboard</NavLink>
              ) : (
                <NavLink href="/scoreboard">Scoreboard</NavLink>
              )}
            </NavItem>
            { loggedInNav }
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
