import { TestBed } from '@angular/core/testing';

import { HeroService } from './hero.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from '../message/message.service';
import { HttpClient } from '@angular/common/http';

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    //TestBed.configureTestingModule({});
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,      
      ],
      providers: [
        HeroService
      ]
    });

    service = TestBed.inject(HeroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
