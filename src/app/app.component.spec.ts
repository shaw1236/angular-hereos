import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';

import { RouterTestingModule } from '@angular/router/testing';

import { Component } from '@angular/core';
@Component({selector: 'app-messages', template: ''})
class NavComponent{}

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent, NavComponent
      ],
      imports: [    
        RouterTestingModule    
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  //it(`should have as title 'angular-tour-of-heroes'`, () => {
  it(`should have as title 'angular-heroes'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    //expect(app.title).toEqual('angular-tour-of-heroes');
    expect(app.title).toEqual('angular-heroes');
  });

  xit('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.content span').textContent).toContain('angular-tour-of-heroes app is running!');
  });
});
