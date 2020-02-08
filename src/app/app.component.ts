import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { exhaustMap, filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { UploaderService } from './uploader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  public uploadProgress: Observable<number>;

  @ViewChild('file', { static: true }) input: ElementRef;
  @ViewChild('uploadBtn', { static: false }) uploadBtn: ElementRef;
  @ViewChild('cancelBtn', { static: false }) cancelBtn: ElementRef;

  constructor(private uploader: UploaderService) {}

  public ngOnInit(): void {
    this.uploadProgress = fromEvent(this.fileInput, 'change').pipe(
      switchMap(() => this.fromUploadBtn),
      map(() => this.fileInput.files[0]),
      filter(file => !!file),
      map(file => this.createFormData(file)),
      exhaustMap(data => this.uploader.upload(data).pipe(
        takeUntil(this.fromCancelBtn)
      )),
      startWith(0)
    );
  }

  private get fileInput(): HTMLInputElement {
    return this.input.nativeElement;
  }

  private get fromUploadBtn(): Observable<Event> {
    return fromEvent(this.uploadBtn.nativeElement, 'click');
  }

  private get fromCancelBtn(): Observable<Event> {
    return fromEvent(this.cancelBtn.nativeElement, 'click');
  }

  private createFormData(file): FormData {
    const form = new FormData();
    form.append('file', file);
    return form;
  }
}
