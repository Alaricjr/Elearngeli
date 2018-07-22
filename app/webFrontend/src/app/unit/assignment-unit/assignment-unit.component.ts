import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {UnitFormService} from "../../shared/services/unit-form.service";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {IAssignmentUnit} from "../../../../../../shared/models/units/IAssignmentUnit";
import {UploadFormComponent} from "../../shared/components/upload-form/upload-form.component";
import {IFileUnit} from "../../../../../../shared/models/units/IFileUnit";
import {IFile} from '../../../../../../shared/models/IFile';
import {AssignmentService} from "../../shared/services/data.service";
import {UserService} from '../../shared/services/user.service';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

enum AssignmentIcon {
    TURNED_IN = 'assignment_turned_in',
    ACCEPTED = 'done',
    FAILED = 'clear',
}

@Component({
    selector: 'app-assignment-unit',
    templateUrl: './assignment-unit.component.html',
    styleUrls: ['./assignment-unit.component.scss']
})
export class AssignmentUnitComponent implements OnInit {
    @Input() assignmentUnit: IAssignmentUnit;
    @ViewChild(UploadFormComponent) public uploadForm: UploadFormComponent;

    allowedMimeTypes: string[];
    unitForm: FormGroup;
    uploadPath: string;
    assignmentIcon: AssignmentIcon;

    public showUploadForm: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    data = this.showUploadForm.asObservable();

    file: IFile = null;

    constructor(public unitFormService: UnitFormService,
                public formBuilder: FormBuilder,
                public userService: UserService,
                private assignmentService: AssignmentService) {
    }

    ngOnInit() {

        if (this.assignmentUnit.assignments.length) {
            this.updateShowUploadForm(false);
            this.file = this.assignmentUnit.assignments[0].file;

            if (this.assignmentUnit.assignments[0].checked === 1) {
                this.assignmentIcon = AssignmentIcon.ACCEPTED;
            } else if (this.assignmentUnit.assignments[0].checked === 2) {
                this.assignmentIcon = AssignmentIcon.FAILED;
            } else {
                this.assignmentIcon = AssignmentIcon.TURNED_IN;
            }
        }

        this.uploadPath = '/api/units/' + this.assignmentUnit._id + '/assignment';
        this.allowedMimeTypes = ['text/plain'];

        this.unitFormService.unitInfoText = 'Assignments Info';
        this.unitFormService.headline = 'Assignments';

        this.unitForm = this.unitFormService.unitForm;

        this.unitForm.addControl('deadline', new FormControl(this.assignmentUnit.deadline));
        this.unitForm.addControl('assignments', new FormControl(this.assignmentUnit.assignments));

        if (this.assignmentUnit) {
            this.unitForm.patchValue({
                deadline: this.assignmentUnit.deadline,
                assignments: this.assignmentUnit.assignments
            });
        }
    }

    public updateShowUploadForm = (shown: boolean) => {
        this.showUploadForm.next(shown);
    }

    public startUpload() {
        try {
            this.uploadForm.fileUploader.uploadAll();
        } catch (error) {
        }
    }

    public onFileUploaded(event: IFileUnit) {
    }

    public onAllUploaded() {
        this.updateShowUploadForm(false);
    }

    public isObjectInQueue() {
        if (this.uploadForm) {
            return this.uploadForm.fileUploader.queue.length > 0;
        }
    }

    public isSubmited() {
        if (!this.assignmentUnit.assignments.length) {
            return true;
        } else {
            if (this.assignmentUnit.assignments[0].submitted) {
                return true;
            }
            return false;
        }
    }

    public deleteAssignment() {
        this.updateShowUploadForm(true);
        this.assignmentService.deleteAssignment(this.assignmentUnit._id.toString(), this.updateShowUploadForm);
    }

    public canBeDeleted() {
        if (this.assignmentUnit.assignments.length) {
            return true;
        } else {
            return false;
        }
    }

    public readyForGreating() {
        if (this.assignmentUnit.assignments.length) {
            if (this.assignmentUnit.assignments[0].submitted) {
                return true;
            }
        }
        return false;
    }

    public submitAssignment() {
        this.assignmentUnit.assignments[0].submitted = true;
        this.assignmentService.updateAssignment(this.assignmentUnit.assignments[0], this.assignmentUnit._id.toString());
    }

    public submitStatusChange(unitId, approved) {
        const assignmentIndex = this.getElementIndexById(this.assignmentUnit.assignments, unitId);
        this.assignmentUnit.assignments[assignmentIndex].checked = approved;
    }

    private getElementIndexById(arr, id) {
        return arr.findIndex((item) => {
            return item._id === id
        })
    }
}
