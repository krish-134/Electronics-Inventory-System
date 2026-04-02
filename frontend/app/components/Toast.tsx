import { Slide, Snackbar, alpha } from "@mui/material";

function SlideTransition(props: any) {
	return <Slide {...props} direction="up" />;
}

export enum ToastStyle {
	ERROR,
	WARNING,
	SUCCESS
}

const Styles: ReadonlyMap<number, object> = new Map([
  [ToastStyle.ERROR, {
		content: {
			sx: {
				bgcolor: alpha('#ef5350', 0.5),
				backgroundImage: 'none',
				color: '#ef5350'
			}
		}
	}],
  [ToastStyle.WARNING, {
		content: {
			sx: {
				bgcolor: alpha('#ffef62', 0.5),
				backgroundImage: 'none',
				color: '#ffef62'
			}
		}
	}], 
  [ToastStyle.SUCCESS, {
		content: {
			sx: {
				bgcolor: alpha('#4caf50', 0.5),
				backgroundImage: 'none',
				color: '#4caf50'
			}
		}
	}],
]);

function Toast({ open, setOpen, text, style } : {open: any, setOpen: any, text: string | undefined, style: ToastStyle}) : React.JSX.Element {
	return <Snackbar
		open={open}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		slots={{ transition: SlideTransition }}
		autoHideDuration={2500}
		onClose={() => setOpen(false)}
		message={text ?? "Something went wrong!"}
		slotProps={Styles.get(style)}
	/>
}

export default Toast;