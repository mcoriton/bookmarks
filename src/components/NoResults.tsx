import * as React from 'react';
import SentimentVeryDissatisfied from 'material-ui-icons/SentimentVeryDissatisfied';
import { Typography } from 'material-ui';

export interface NoResultsState {}

export interface NoResultsProps {
  message: string;
}

class NoResults extends React.Component<NoResultsProps, NoResultsState> {
  constructor(props: NoResultsProps) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div style={{ textAlign: 'center', margin: 'auto' }}>
        <SentimentVeryDissatisfied style={{ width: 50, height: 50, marginBottom: 20 }} />
        <Typography>{this.props.message}</Typography>
      </div>
    );
  }
}

export default NoResults;
