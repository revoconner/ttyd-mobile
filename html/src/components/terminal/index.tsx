import { bind } from 'decko';
import { Component, h } from 'preact';
import { Xterm, XtermOptions } from './xterm';

import '@xterm/xterm/css/xterm.css';
import { Modal } from '../modal';

interface Props extends XtermOptions {
    id: string;
}

interface State {
    modal: boolean;
    ctrlActive: boolean;
    altActive: boolean;
}

export class Terminal extends Component<Props, State> {
    private container: HTMLElement;
    private toolbar: HTMLElement;
    private xterm: Xterm;

    constructor(props: Props) {
        super();
        this.xterm = new Xterm(props, this.showModal);
    }

    async componentDidMount() {
        await this.xterm.refreshToken();
        this.xterm.open(this.container);
        this.xterm.connect();

        // Keep the toolbar pinned above the software keyboard: on iOS the
        // layout viewport does not shrink when the keyboard opens, so a
        // fixed bottom bar would be hidden behind it. The VisualViewport
        // API tells us how much of the layout viewport is covered.
        const vv = window.visualViewport;
        if (vv) {
            vv.addEventListener('resize', this.updateToolbarPosition);
            vv.addEventListener('scroll', this.updateToolbarPosition);
            window.addEventListener('resize', this.updateToolbarPosition);
            this.updateToolbarPosition();
        }
    }

    componentWillUnmount() {
        this.xterm.dispose();
        const vv = window.visualViewport;
        if (vv) {
            vv.removeEventListener('resize', this.updateToolbarPosition);
            vv.removeEventListener('scroll', this.updateToolbarPosition);
            window.removeEventListener('resize', this.updateToolbarPosition);
        }
    }

    render({ id }: Props, { modal, ctrlActive, altActive }: State) {
        return (
            <div id={id} class="terminal-wrapper">
                <div
                    class="terminal-main"
                    ref={c => {
                        this.container = c as HTMLElement;
                    }}
                >
                    <Modal show={modal}>
                        <label class="file-label">
                            <input onChange={this.sendFile} class="file-input" type="file" multiple />
                            <span class="file-cta">Choose files…</span>
                        </label>
                    </Modal>
                </div>
                <div
                    class="toolbar"
                    ref={c => {
                        this.toolbar = c as HTMLElement;
                    }}
                >
                    <button class={`toolbar-btn ${ctrlActive ? 'active' : ''}`} onMouseDown={this.onCtrl}>
                        Ctrl
                    </button>
                    <button class={`toolbar-btn ${altActive ? 'active' : ''}`} onMouseDown={this.onAlt}>
                        Alt
                    </button>
                    <button class="toolbar-btn" onMouseDown={this.onTab}>
                        Tab
                    </button>
                    <button class="toolbar-btn" onMouseDown={this.onEsc}>
                        Esc
                    </button>
                    <button class="toolbar-btn" onMouseDown={this.onArrowUp}>
                        ↑
                    </button>
                    <button class="toolbar-btn" onMouseDown={this.onArrowDown}>
                        ↓
                    </button>
                    <button class="toolbar-btn" onMouseDown={this.onArrowLeft}>
                        ←
                    </button>
                    <button class="toolbar-btn" onMouseDown={this.onArrowRight}>
                        →
                    </button>
                </div>
            </div>
        );
    }

    @bind
    updateToolbarPosition() {
        const vv = window.visualViewport;
        if (!vv || !this.toolbar) return;
        const offset = document.documentElement.clientHeight - vv.height - vv.offsetTop;
        this.toolbar.style.transform = `translate3d(0, ${-Math.max(0, Math.round(offset))}px, 0)`;
    }

    @bind
    showModal() {
        this.setState({ modal: true });
    }

    @bind
    sendFile(event: Event) {
        this.setState({ modal: false });
        const files = (event.target as HTMLInputElement).files;
        if (files) this.xterm.sendFile(files);
    }

    @bind
    onEsc(event: Event) {
        event.preventDefault();
        this.xterm.sendEscape();
    }

    @bind
    onTab(event: Event) {
        event.preventDefault();
        this.xterm.sendTab();
    }

    @bind
    onCtrl(event: Event) {
        event.preventDefault();
        const { ctrlActive } = this.state;
        if (ctrlActive) {
            this.xterm.disableCtrlMode();
            this.setState({ ctrlActive: false });
        } else {
            this.xterm.enableCtrlMode(() => this.setState({ ctrlActive: false }));
            this.setState({ ctrlActive: true });
        }
    }

    @bind
    onAlt(event: Event) {
        event.preventDefault();
        const { altActive } = this.state;
        if (altActive) {
            this.xterm.disableAltMode();
            this.setState({ altActive: false });
        } else {
            this.xterm.enableAltMode(() => this.setState({ altActive: false }));
            this.setState({ altActive: true });
        }
    }

    @bind
    onArrowUp(event: Event) {
        event.preventDefault();
        this.xterm.sendArrowUp();
    }

    @bind
    onArrowDown(event: Event) {
        event.preventDefault();
        this.xterm.sendArrowDown();
    }

    @bind
    onArrowLeft(event: Event) {
        event.preventDefault();
        this.xterm.sendArrowLeft();
    }

    @bind
    onArrowRight(event: Event) {
        event.preventDefault();
        this.xterm.sendArrowRight();
    }
}
