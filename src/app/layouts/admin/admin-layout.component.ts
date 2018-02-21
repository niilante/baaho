import { Component, OnInit, OnDestroy, ViewChild, HostListener, AnimationTransitionEvent, NgZone, AfterViewInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import { MenuItems } from '../../shared/menu-items/menu-items';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import { TranslateService } from '@ngx-translate/core';

const SMALL_WIDTH_BREAKPOINT = 991;

export interface Options {
  heading?: string;
  removeFooter?: boolean;
  mapHeader?: boolean;
}

@Component({
  selector: 'app-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit, OnDestroy, AfterViewInit {

  private _router: Subscription;
  private mediaMatcher: MediaQueryList = matchMedia(`(max-width: ${SMALL_WIDTH_BREAKPOINT}px)`);

  currentLang = 'en';
  options: Options;
  theme = 'light';
  showSettings = false;
  isDocked = false;
  isBoxed = false;
  isOpened = true;
  mode = 'push';
  _mode = this.mode;
  _autoCollapseWidth = 991;
  width = window.innerWidth;

  @ViewChild('sidebar') sidebar;

  constructor (
    public menuItems: MenuItems,
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private modalService: NgbModal,
    private titleService: Title,
    private zone: NgZone) {
    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
    this.mediaMatcher.addListener(mql => zone.run(() => this.mediaMatcher = mql));
  }

  ngOnInit(): void {

    if (this.isOver()) {
      this._mode = 'over';
      this.isOpened = false;
    }

    this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
      // Scroll to top on view load
      document.querySelector('.main-content').scrollTop = 0;
      this.runOnRouteChange();
    });
  }

  ngAfterViewInit(): void  {
    setTimeout(_ => this.runOnRouteChange());
  }

  ngOnDestroy() {
    this._router.unsubscribe();
  }

  runOnRouteChange(): void {
    if (this.isOver() || this.router.url === '/maps/fullscreen') {
      this.isOpened = false;
    }

    this.route.children.forEach((route: ActivatedRoute) => {
      let activeRoute: ActivatedRoute = route;
      while (activeRoute.firstChild) {
        activeRoute = activeRoute.firstChild;
      }
      this.options = activeRoute.snapshot.data;
    });

    if (this.options) {
      if (this.options.hasOwnProperty('heading')) {
        this.setTitle(this.options.heading);
      }
    }
  }

  setTitle( newTitle: string) {
    this.titleService.setTitle( 'Baaho - Your Freedom for Life | ' + newTitle );
  }

  toogleSidebar(): void {
    this.isOpened = !this.isOpened;
  }

  isOver(): boolean {
    return window.matchMedia(`(max-width: 991px)`).matches;
  }

  openSearch(search) {
    this.modalService.open(search, { windowClass: 'search', backdrop: false });
  }

  addMenuItem(): void {
    this.menuItems.add({
      state: 'menu',
      name: 'MENU',
      type: 'sub',
      icon: 'basic-webpage-txt',
      children: [
        {state: 'menu', name: 'MENU'},
        {state: 'menu', name: 'MENU'}
      ]
    });
  }
}
