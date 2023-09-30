'use client'

import { createRef, forwardRef, FunctionComponent, PureComponent, RefCallback } from "react";
import { leafConfig, leafI } from "@wonderlandlabs/forest/lib/types";
import { BehaviorSubject, debounceTime, Subject, Subscription, switchMap, from } from "rxjs";
import { Forest } from "@wonderlandlabs/forest";

interface ViewProps extends FunctionComponent {
  ref: any;
}

let id = 0;
const DEFAULT = {
  stateProp: 'state',
  valueProp: 'value',
}

type WithForestOptions = {
  stateProp?: string,
  valueProp?: string,
  leafConstructor?: (props: Record<string, any>) => leafConfig
}

const UNMOUNT_THRESHOLD = 300;
const DEBUG = true;

export default function withForest(View: ViewProps, options: WithForestOptions = DEFAULT) {

  const { stateProp = 'state', valueProp = 'value', leafConstructor } = options;

  class ForestComponent extends PureComponent {

    constructor(props: any) {
      super(props);
      this.state = { leaf: null, value: null, };
      this.createForest = this.createForest.bind(this);
      this.updateChildRef = this.updateChildRef.bind(this);
      this.checkForUnmounting = this.checkForUnmounting.bind(this);
      this.childRef = createRef<HTMLDivElement | null>();
      if (leafConstructor) {
        this.createForest(leafConstructor(props));
      }
      this.eleStream.subscribe(this.checkForUnmounting);
    }

    private childRef;
    private _leaf?: leafI | null;

    createForest(config: leafConfig) {
      if (config) {
        const leaf = new Forest(config)
        if (this._mounted) {
          this.initLeaf(leaf)
        } else {
          this._leaf = leaf;
        }
      }
    }

    private _urlObserver?: MutationObserver;

    watchForUrlChange() {
      let oldHref = document.location.href;
      const body = document.querySelector("body");
      if (!body) {
        return;
      }

      const self = this;
      this._urlObserver = new MutationObserver(() => {
        if (oldHref !== document.location.href) {
          self.terminate();
        }
      });
      this._urlObserver.observe(body, { childList: true, subtree: true });
    }

    eleStream = new BehaviorSubject<HTMLElement | null>(null)

    updateChildRef: RefCallback<HTMLElement> = (ele: HTMLElement | null) => {
      if (ele) {
        this.eleStream.next(ele);
      }
    }

    private _sub?: Subscription;

    initLeaf(leaf: leafI) {
      this.setState((state) => ({ ...state, leaf, value: leaf.value }));
      const self = this;
      this._sub = leaf.subscribe({
        next(value: any) {
          self.setState((state) => ({ ...state, value }));
        },
        error(err: Error) {
          console.log('state error: ', err);
        }
      });
    }

    private _mounted = false;

    componentDidMount() {
      if (this._leaf) {
        this.initLeaf(this._leaf);
        this._leaf = null;
      }
      this.watchForUrlChange();

      const self = this;
      // terminate if a disconnected/missing element is detected in UNMOUNT_THRESHOLD ms;
      this.hasConnectedEle
        .pipe(debounceTime(UNMOUNT_THRESHOLD))
        .subscribe({
          next(value) {
            if (value) {
              self.terminate();
            }
          },
          error(_err) {
          }
        });
      this._mounted = true;
    }

    terminate() {
      this._sub?.unsubscribe();
      this.hasConnectedEle.complete();
      this.eleStream.complete();
      this._urlObserver?.disconnect();
      if (DEBUG) {
        console.log('terminating forest instance')
      }
    }

    get _currentEle(): HTMLElement | null {
      return this.eleStream.value;
    }

    hasConnectedEle = new Subject();

    private checkForUnmounting() {
      if (
        (!this._currentEle?.parentNode) ||
        (!this._currentEle.isConnected)
      ) {
        this.hasConnectedEle.next(true);
      } else {
        this.hasConnectedEle.next(false);
      }
    }

    componentWillUnmount() {
      setTimeout(() => {
        this.checkForUnmounting();
      }, 200)
    }

    render() {
      // @ts-ignore
      const { leaf, value } = this.state;
      if (!leaf) {
        // @ts-ignore
        const view = <View
          {...this.props}
          {...{ createForest: this.createForest, [stateProp]: null, [valueProp]: undefined }
          }
        />
        return (
          <div style={{ display: 'none' }} ref={this.updateChildRef}>
            {view}
          </div>)
      } else {
        //@ts-ignore
        return <View{...this.props}{...{ [stateProp]: leaf, [valueProp]: value }} ref={this.updateChildRef}/>
      }
    }
  }


  return ForestComponent;
}
