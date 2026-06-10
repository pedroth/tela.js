// Totally AI gen code, no human was involved in the making of this file. Do not edit.
/**
 *  prompt : I want to substitute kamal sdl by one made my you using node/bun compatible ffi and native c sdl2, can you do it?
 *  The library should implement all functions mentioned in Window.js
 *
 *  only those.. not more,
 */


import koffi from 'koffi';

const SDL_INIT_VIDEO           = 0x00000020;
const SDL_WINDOWPOS_CENTERED   = 0x2FFF0000;
const SDL_WINDOW_SHOWN         = 0x00000004;
const SDL_WINDOW_RESIZABLE     = 0x00000020;
const SDL_RENDERER_ACCELERATED = 0x00000002;
const SDL_PIXELFORMAT_RGBA32   = 0x16762004;
const SDL_TEXTUREACCESS_STREAMING = 1;

const SDL_QUIT                 = 0x100;
const SDL_WINDOWEVENT          = 0x200;
const SDL_WINDOWEVENT_RESIZED  = 5;
const SDL_WINDOWEVENT_CLOSE    = 14;
const SDL_KEYDOWN              = 0x300;
const SDL_KEYUP                = 0x301;
const SDL_MOUSEMOTION          = 0x400;
const SDL_MOUSEBUTTONDOWN      = 0x401;
const SDL_MOUSEBUTTONUP        = 0x402;
const SDL_MOUSEWHEEL           = 0x403;

let lib;
try      { lib = koffi.load('libSDL2-2.0.so.0'); }
catch(_) { lib = koffi.load('libSDL2.so');        }

const SDL_Init            = lib.func('int SDL_Init(uint32 flags)');
const SDL_Quit            = lib.func('void SDL_Quit()');
const SDL_CreateWindow    = lib.func('void *SDL_CreateWindow(const char *title, int x, int y, int w, int h, uint32 flags)');
const SDL_DestroyWindow   = lib.func('void SDL_DestroyWindow(void *window)');
const SDL_HideWindow      = lib.func('void SDL_HideWindow(void *window)');
const SDL_MaximizeWindow  = lib.func('void SDL_MaximizeWindow(void *window)');
const SDL_SetWindowTitle  = lib.func('void SDL_SetWindowTitle(void *window, const char *title)');
const SDL_SetWindowSize   = lib.func('void SDL_SetWindowSize(void *window, int w, int h)');
const SDL_GetWindowID     = lib.func('uint32 SDL_GetWindowID(void *window)');
const SDL_CreateRenderer  = lib.func('void *SDL_CreateRenderer(void *window, int index, uint32 flags)');
const SDL_DestroyRenderer = lib.func('void SDL_DestroyRenderer(void *renderer)');
const SDL_CreateTexture   = lib.func('void *SDL_CreateTexture(void *renderer, uint32 format, int access, int w, int h)');
const SDL_DestroyTexture  = lib.func('void SDL_DestroyTexture(void *texture)');
const SDL_UpdateTexture   = lib.func('int SDL_UpdateTexture(void *texture, void *rect, void *pixels, int pitch)');
const SDL_RenderClear     = lib.func('int SDL_RenderClear(void *renderer)');
const SDL_RenderCopy      = lib.func('int SDL_RenderCopy(void *renderer, void *texture, void *srcrect, void *dstrect)');
const SDL_RenderPresent   = lib.func('void SDL_RenderPresent(void *renderer)');
const SDL_PollEvent       = lib.func('int SDL_PollEvent(void *event)');
const SDL_GetKeyName      = lib.func('const char *SDL_GetKeyName(int key)');

SDL_Init(SDL_INIT_VIDEO);
process.on('exit', () => SDL_Quit());

const windowsById = new Map();
let _pollTimer = null;

const _eventBuf  = Buffer.allocUnsafe(56);
const _eventView = new DataView(_eventBuf.buffer, _eventBuf.byteOffset);

function _pollEvents() {
    while (SDL_PollEvent(_eventBuf)) {
        const type     = _eventView.getUint32(0, true);
        const windowID = _eventView.getUint32(8, true);
        const win      = windowsById.get(windowID);
        switch (type) {
            case SDL_QUIT:
                process.exit(0);
                break;
            case SDL_WINDOWEVENT: {
                const evtId = _eventView.getUint8(12);
                if (evtId === SDL_WINDOWEVENT_CLOSE) {
                    win?.destroy();
                    process.exit(0);
                } else if (evtId === SDL_WINDOWEVENT_RESIZED) {
                    const w = _eventView.getInt32(16, true);
                    const h = _eventView.getInt32(20, true);
                    win?._dispatch('resize', { width: w, height: h });
                }
                break;
            }
            case SDL_KEYDOWN:
            case SDL_KEYUP: {
                const sym = _eventView.getInt32(20, true);
                const key = SDL_GetKeyName(sym)?.toLowerCase() ?? '';
                win?._dispatch(type === SDL_KEYDOWN ? 'keyDown' : 'keyUp', { key });
                break;
            }
            case SDL_MOUSEMOTION: {
                const x = _eventView.getInt32(20, true);
                const y = _eventView.getInt32(24, true);
                win?._dispatch('mouseMove', { x, y });
                break;
            }
            case SDL_MOUSEBUTTONDOWN:
            case SDL_MOUSEBUTTONUP: {
                const button = _eventView.getUint8(16);
                const x      = _eventView.getInt32(20, true);
                const y      = _eventView.getInt32(24, true);
                win?._dispatch(type === SDL_MOUSEBUTTONDOWN ? 'mouseButtonDown' : 'mouseButtonUp', { button, x, y });
                break;
            }
            case SDL_MOUSEWHEEL: {
                const dx = _eventView.getInt32(16, true);
                const dy = _eventView.getInt32(20, true);
                win?._dispatch('mouseWheel', { dx, dy });
                break;
            }
        }
    }
}

class SDLWindow {
    constructor(winPtr, width, height) {
        this._winPtr    = winPtr;
        this._id        = SDL_GetWindowID(winPtr);
        this._renderer  = SDL_CreateRenderer(winPtr, -1, SDL_RENDERER_ACCELERATED);
        if (!this._renderer) throw new Error('SDL_CreateRenderer failed');
        this._texture   = SDL_CreateTexture(this._renderer, SDL_PIXELFORMAT_RGBA32, SDL_TEXTUREACCESS_STREAMING, width, height);
        this._texW      = width;
        this._texH      = height;
        this._listeners = {};
        windowsById.set(this._id, this);
        if (!_pollTimer) _pollTimer = setInterval(_pollEvents, 8);
    }

    setTitle(title) { SDL_SetWindowTitle(this._winPtr, title); }

    render(width, height, pitch, _format, buffer) {
        if (width !== this._texW || height !== this._texH) {
            SDL_DestroyTexture(this._texture);
            this._texture = SDL_CreateTexture(this._renderer, SDL_PIXELFORMAT_RGBA32, SDL_TEXTUREACCESS_STREAMING, width, height);
            this._texW = width;
            this._texH = height;
        }
        SDL_UpdateTexture(this._texture, null, buffer, pitch);
        SDL_RenderClear(this._renderer);
        SDL_RenderCopy(this._renderer, this._texture, null, null);
        SDL_RenderPresent(this._renderer);
    }

    hide()        { SDL_HideWindow(this._winPtr); }
    maximize()    { SDL_MaximizeWindow(this._winPtr); }
    setSize(w, h) { SDL_SetWindowSize(this._winPtr, w, h); }

    on(event, handler) { (this._listeners[event] ??= []).push(handler); }

    destroy() {
        windowsById.delete(this._id);
        if (windowsById.size === 0 && _pollTimer !== null) { clearInterval(_pollTimer); _pollTimer = null; }
        if (this._texture)  { SDL_DestroyTexture(this._texture);   this._texture  = null; }
        if (this._renderer) { SDL_DestroyRenderer(this._renderer); this._renderer = null; }
        if (this._winPtr)   { SDL_DestroyWindow(this._winPtr);     this._winPtr   = null; }
    }

    _dispatch(event, data) {
        const fns = this._listeners[event];
        if (fns) for (const fn of fns) fn(data);
    }
}

const sdl = {
    video: {
        createWindow({ title = '', width, height, resizable = false }) {
            const flags  = SDL_WINDOW_SHOWN | (resizable ? SDL_WINDOW_RESIZABLE : 0);
            const winPtr = SDL_CreateWindow(title, SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, width, height, flags);
            if (!winPtr) throw new Error('SDL_CreateWindow failed');
            return new SDLWindow(winPtr, width, height);
        }
    }
};

export default sdl;
