import { Component, inject, input, OnInit, output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";

@Component({
    selector: 'comment-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './comment-form.component.html',
    styleUrl: './comment-form.component.scss'
})

export class CommentFormComponent implements OnInit {
    fb = inject(FormBuilder);

    submitLabel = input<string>("Submit");
    hasCancelButton = input<boolean>(false);
    initialText = input<string>('');    

    handleSubmit = output<string>();
    handleCancel = output<void>();

    form!: FormGroup;

    ngOnInit(): void {
        this.form = this.fb.group({            
            content: [this.initialText(), Validators.required]
        })
    }

    onSubmit(): void {       
        this.handleSubmit.emit(this.form.value.content);
        this.form.reset();
    }
}