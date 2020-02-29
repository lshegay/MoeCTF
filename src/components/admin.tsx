import React, {
  useState,
  FunctionComponent,
  HTMLAttributes,
} from 'react';
import {
  Button,
  Collapse,
} from 'reactstrap';

interface PanelProps extends HTMLAttributes<HTMLElement> {

}

const Panel: FunctionComponent<PanelProps> = ({ children, className, ...rest }) => {
  const [adminVisibility, setAdminVisibility] = useState(false);

  return (
    <div className={`mb-4 ${className}`} {...rest}>
      <Button
        color="primary"
        onClick={(): void => setAdminVisibility(!adminVisibility)}
        className="mb-4 btn-block"
      >
        Open Admin UI
      </Button>
      <Collapse isOpen={adminVisibility}>
        {children}
      </Collapse>
    </div>
  );
};

export default Panel;
