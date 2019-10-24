import React, { HTMLAttributes } from 'react';
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

import User from '../interfaces/User';
import { CoinsUser } from '../modules/Coins';
import config from '../../server/Config';


interface NavigationProps extends HTMLAttributes<HTMLElement> {
  currentNav?: string;
  user?: User;
}

interface NavigationStates {
  isMenuOpen: boolean;
}

class Navigation extends React.PureComponent<NavigationProps, NavigationStates> {
  constructor(props: NavigationProps) {
    super(props);

    this.state = {
      isMenuOpen: false,
    };

    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu(): void {
    this.setState(({ isMenuOpen }) => ({
      isMenuOpen: !isMenuOpen,
    }));
  }

  render(): JSX.Element {
    const {
      currentNav,
      className,
      user,
    } = this.props;
    const { isMenuOpen } = this.state;

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
              {`${(user as CoinsUser).wallet} `}
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
      <>
        <Navbar color="dark" dark expand="md" className={className}>
          <Container>
            <NavbarBrand href="/">{config.siteTitle}</NavbarBrand>
            <NavbarToggler onClick={this.toggleMenu} />
            <Collapse isOpen={isMenuOpen} navbar>
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
      </>
    );
  }
}

export default Navigation;
