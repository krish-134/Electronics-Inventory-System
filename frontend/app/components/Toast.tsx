import { Slide, Snackbar, alpha } from "@mui/material";

function SlideTransition(props: any) {
	return <Slide {...props} direction="up" />;
}

export enum ToastStyle {
	ERROR,
	// WARNING,
	SUCCESS
}

const Styles: ReadonlyMap<number, object> = new Map([
  [ToastStyle.ERROR, {
		content: {
			sx: {
				bgcolor: '#B71C1C',
				backgroundImage: 'none',
				color: '#FF8A80'
			}
		}
	}],
//   [ToastStyle.WARNING, {
// 		content: {
// 			sx: {
// 				bgcolor: alpha('#ffef62', 0.5),
// 				backgroundImage: 'none',
// 				color: '#ffef62'
// 			}
// 		}
// 	}], 
  [ToastStyle.SUCCESS, {
		content: {
			sx: {
				bgcolor: '#9FE2BF',
				backgroundImage: 'none',
				color: '#023020'
			}
		}
	}],
]);

export type ToastInput = {display: string | undefined, level: ToastStyle};

function Toast({ open, setOpen, content } : {open: any, setOpen: any, content: ToastInput | undefined}) : React.JSX.Element {
	if (!content) return <></>;

	return <Snackbar
		open={open}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		slots={{ transition: SlideTransition }}
		autoHideDuration={7500}
		onClose={() => setOpen(false)}
		message={content?.display ?? "Something went wrong!"}
		slotProps={Styles.get(content?.level)}
		sx={{zIndex: 99999999}}
		className="z-99999999"
	/>
}

export default Toast;