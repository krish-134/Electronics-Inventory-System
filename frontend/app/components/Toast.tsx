import { Slide, Snackbar, alpha } from "@mui/material";

function SlideTransition(props: any) {
	return <Slide {...props} direction="down" />;
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
				bgcolor: alpha('#ef5350', 0.25),
				backgroundImage: 'none',
				color: '#ef5350'
			}
		}
	}],
  [ToastStyle.WARNING, {}], // TODO
  [ToastStyle.SUCCESS, {}],
]);

function Toast({ open, setOpen, text, style } : {open: any, setOpen: any, text: string | undefined, style: ToastStyle}) : React.JSX.Element {
	return <Snackbar
		open={open}
		anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
		slots={{ transition: SlideTransition }}
		autoHideDuration={2500}
		onClose={() => setOpen(false)}
		message={text ?? "Something went wrong!"}
		slotProps={Styles.get(style)}
	/>
}

export default Toast;