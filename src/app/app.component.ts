import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, fromEvent, Observable, Subscription } from 'rxjs';
import { exhaustMap, filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { HttpClient, HttpEventType, HttpProgressEvent } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private inputEvent: Subscription;
  public progressBarWidth = new BehaviorSubject<number>(0);

  @ViewChild('file', { static: false }) input: ElementRef;
  @ViewChild('uploadBtn', { static: false }) uploadBtn: ElementRef;
  @ViewChild('cancelBtn', { static: false }) cancelBtn: ElementRef;

  constructor(private http: HttpClient) {}

  public ngAfterViewInit(): void {
    const fromUploadBtn = fromEvent(this.uploadBtn.nativeElement, 'click');
    const fromCancelBtn = fromEvent(this.cancelBtn.nativeElement, 'click');

    this.inputEvent = fromEvent(this.fileInput, 'change').pipe(
      switchMap(() => fromUploadBtn),
      map(() => this.fileInput.files[0]),
      filter(file => !!file),
      map(file => this.createFormData(file)),
      exhaustMap(data => this.upload(data).pipe(
        takeUntil(fromCancelBtn)
      )),
      startWith(0)
    ).subscribe({
      next: width => this.progressBarWidth.next(width)
    });
  }

  private get fileInput(): HTMLInputElement {
    return this.input.nativeElement;
  }

  private upload(data: FormData): Observable<number> {
    return this.http.post('/upload', data, { reportProgress: true, observe: 'events' })
      .pipe(
        filter(event => event.type === HttpEventType.UploadProgress),
        map(event => event as HttpProgressEvent),
        map(event => event.loaded / event.total * 100)
      );
  }

  private createFormData(file): FormData {
    const form = new FormData();
    form.append('file', file);
    return form;
  }

  public ngOnDestroy(): void {
    this.progressBarWidth.complete();

    if (this.inputEvent) {
      this.inputEvent.unsubscribe();
    }
  }
}
