import { Theme, MuiThemeProvider } from 'material-ui';
import * as React from 'react';

// tslint:disable-next-line:variable-name
function withRoot(Component: React.ComponentType, theme: Theme) {
  // tslint:disable-next-line:function-name
  function WithRoot(props: any) {
    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    const newprops: any = Object.assign({ theme }, props);
    return (
      <MuiThemeProvider theme={theme}>
        <Component {...newprops} />
      </MuiThemeProvider>
    );
  }

  return WithRoot;
}

export default withRoot;
