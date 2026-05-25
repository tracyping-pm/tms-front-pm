import { Result, Statistic } from 'antd';
import type { ErrorInfo } from 'react';
import React, { Component } from 'react';

const { Countdown } = Statistic;

enum ErrorTypeEnum {
  NORMAL = 'normal',
  CHUNK_LOADING_FAILED = 'chunkLoadingFailed',
}

interface ICustomErrorBoundary {
  children?: React.ReactNode;
}

export default class CustomErrorBoundary extends Component<ICustomErrorBoundary> {
  state = {
    hasError: false,
    errorInfo: '',
    errorType: ErrorTypeEnum.NORMAL,
  };

  render() {
    if (this.state.hasError) {
      const { errorType } = this.state;
      return errorType === ErrorTypeEnum.NORMAL ? (
        <Result
          status="error"
          title="Something went wrong..."
          subTitle="Please refresh page."
          extra={this.state.errorInfo}
        />
      ) : (
        <Result
          status="info"
          title="System version has been updated."
          subTitle="About to automatically refresh the page for updates."
          extra={
            <Countdown
              title="Refresh page after 5s countdown"
              format="ss"
              value={Date.now() + 1000 * 5}
              onFinish={() => {
                window.location.reload();
              }}
            />
          }
        />
      );
    } else {
      return this.props.children;
    }
  }

  static getDerivedStateFromError(error: Error) {
    const jsPattern = /Loading chunk (\S)+ failed/g;
    const cssPattern = /Loading CSS chunk (\S)+ failed/g;
    const isChunkLoadFailed =
      error.message.match(jsPattern) || error.message.match(cssPattern);

    if (isChunkLoadFailed) {
      return {
        hasError: true,
        errorInfo: error.message,
        errorType: ErrorTypeEnum.CHUNK_LOADING_FAILED,
      };
      // window.location.reload();
    }

    return {
      hasError: true,
      errorInfo: error.message,
      errorType: ErrorTypeEnum.NORMAL,
    };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.log({ error, errorInfo });
  }
}
