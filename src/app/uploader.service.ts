import { Injectable } from '@angular/core';
import {HttpClient, HttpEventType, HttpProgressEvent} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UploaderService {
  constructor(private http: HttpClient) { }

  public upload(data: FormData): Observable<number> {
    return this.http.post('/upload', data, { reportProgress: true, observe: 'events' })
      .pipe(
        filter(event => event.type === HttpEventType.UploadProgress),
        map(event => event as HttpProgressEvent),
        map(event => event.loaded / event.total * 100)
      );
  }
}
