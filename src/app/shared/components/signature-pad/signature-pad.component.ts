import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signature-pad',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="signature-container">
      <div class="signature-header">
        <h3>Customer Signature</h3>
        <button type="button" class="clear-button" (click)="clear()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          Clear
        </button>
      </div>

      <div class="canvas-wrapper">
        <canvas
          #signatureCanvas
          (touchstart)="startDrawing($event)"
          (touchmove)="draw($event)"
          (touchend)="stopDrawing()"
          (mousedown)="startDrawing($event)"
          (mousemove)="draw($event)"
          (mouseup)="stopDrawing()"
          (mouseleave)="stopDrawing()">
        </canvas>
        <div class="signature-line"></div>
        <p class="signature-hint" *ngIf="isEmpty">Sign above</p>
      </div>

      <div class="signature-actions">
        <button type="button" class="cancel-button" (click)="onCancel()">Cancel</button>
        <button type="button" class="save-button" (click)="save()" [disabled]="isEmpty">
          Save Signature
        </button>
      </div>
    </div>
  `,
  styles: [`
    .signature-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px;
      background: var(--glass-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
    }

    .signature-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--color-text-primary);
      }
    }

    .clear-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: transparent;
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all var(--transition-base);

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: var(--glass-bg-light);
        color: var(--color-text-primary);
      }
    }

    .canvas-wrapper {
      position: relative;
      background: white;
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    canvas {
      display: block;
      width: 100%;
      height: 200px;
      touch-action: none;
      cursor: crosshair;
    }

    .signature-line {
      position: absolute;
      bottom: 40px;
      left: 20px;
      right: 20px;
      height: 1px;
      background: rgba(0, 0, 0, 0.2);
      pointer-events: none;
    }

    .signature-hint {
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      margin: 0;
      color: rgba(0, 0, 0, 0.3);
      font-size: 0.85rem;
      pointer-events: none;
    }

    .signature-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }

    .cancel-button,
    .save-button {
      padding: 12px 24px;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
    }

    .cancel-button {
      background: var(--glass-bg-light);
      color: var(--color-text-secondary);
      border: 1px solid var(--glass-border);

      &:hover {
        background: var(--glass-bg);
        color: var(--color-text-primary);
      }
    }

    .save-button {
      background: var(--gradient-primary);
      color: white;
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
    }
  `]
})
export class SignaturePadComponent implements AfterViewInit {
  @ViewChild('signatureCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Output() signatureSaved = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  isEmpty = true;

  ngAfterViewInit(): void {
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d')!;

    // Set canvas size
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Configure drawing style
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    this.isDrawing = true;
    const pos = this.getPosition(event);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing) return;

    event.preventDefault();
    const pos = this.getPosition(event);

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.lastX = pos.x;
    this.lastY = pos.y;
    this.isEmpty = false;
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.isEmpty = true;
  }

  save(): void {
    if (this.isEmpty) return;
    const dataUrl = this.canvas.toDataURL('image/png');
    this.signatureSaved.emit(dataUrl);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private getPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();

    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    } else {
      const touch = event.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  }
}
